
const mongoose = require('mongoose');

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

const Property = require('../models/Property.model');
const Settings = require('../models/Settings.model');
const FraudReport = require('../models/FraudReport.model');
const PropertyPriceHistory = require('../models/PropertyPriceHistory.model');

const {
  analysePropertyFraud,
} = require('../services/aiGateway.service');

// ---------------------------------------------
// RUN AI FRAUD ANALYSIS FOR A PROPERTY
// POST /api/v1/admin/fraud/analyze/:propertyId
// ---------------------------------------------
const analysePropertyFraudForAdmin = asyncHandler(
  async (req, res) => {
    const { propertyId } = req.params;

    if (!mongoose.isValidObjectId(propertyId)) {
      throw new ApiError(400, 'Invalid property ID.');
    }

    // 1. Fetch property and owner.
    const property = await Property.findOne({
      _id: propertyId,
      status: { $nin: ['deleted', 'rejected'] },
    })
      .populate('owner_id', 'full_name email role status')
      .lean();

    if (!property) {
      throw new ApiError(
        404,
        'Property not found or not eligible for fraud analysis.'
      );
    }

    if (!property.owner_id) {
      throw new ApiError(
        400,
        'Property owner information is unavailable.'
      );
    }

    // 2. Load fraud thresholds.
    const settings = await Settings.findOne({
      key: 'global',
    }).lean();

    const priceDeviationThreshold = Math.max(
      0,
      Number(settings?.fraudFlagPriceDeviationPercent ?? 60)
    );

    const maxListingsPerDay = Math.max(
      1,
      Number(settings?.fraudFlagMaxListingsPerDay ?? 10)
    );

    // 3. Count owner's listings today.
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const ownerListingsToday = await Property.countDocuments({
      owner_id: property.owner_id._id,
      created_at: {
        $gte: todayStart,
        $lt: tomorrowStart,
      },
      status: {
        $nin: ['deleted', 'rejected'],
      },
    });

    // 4. Find market benchmark.
    const cityKey = String(
      property.location?.city || ''
    ).trim().toLowerCase();

    const localityKey = String(
      property.location?.locality || ''
    ).trim().toLowerCase();

    let marketSnapshot = null;

    if (cityKey) {
      const marketFilter = {
        city_key: cityKey,
        property_type: property.property_type,
        listing_type: property.listing_type,
        median_price_per_sqft: { $gt: 0 },
      };

      if (localityKey) {
        marketSnapshot = await PropertyPriceHistory.findOne({
          ...marketFilter,
          locality_key: localityKey,
        })
          .sort({ month: -1 })
          .lean();
      }

      if (!marketSnapshot) {
        marketSnapshot = await PropertyPriceHistory.findOne({
          ...marketFilter,
          locality_key: '',
        })
          .sort({ month: -1 })
          .lean();
      }
    }

    const marketMedianPricePerSqft =
      Number(marketSnapshot?.median_price_per_sqft) > 0
        ? Number(marketSnapshot.median_price_per_sqft)
        : null;

    // 5. Prepare trusted AI payload.
    const fraudPayload = {
      property_id: String(property._id),
      title: property.title || '',
      description: property.description || '',
      price: Number(property.price),
      area_sqft: Number(property.area_sqft),

      ai_predicted_price:
        Number(property.ai_predicted_price) > 0
          ? Number(property.ai_predicted_price)
          : null,

      market_median_price_per_sqft:
        marketMedianPricePerSqft,

      owner_listings_today: ownerListingsToday,
      max_listings_per_day: maxListingsPerDay,

      price_deviation_threshold_percent:
        priceDeviationThreshold,
    };

    // 6. Call Python AI service.
    const aiResult = await analysePropertyFraud(fraudPayload);

    // IMPORTANT:
    // FastAPI returns { success, message, data }.
    // Extract data while also supporting direct responses.
    const assessment =
      aiResult?.data &&
      typeof aiResult.data === 'object' &&
      !Array.isArray(aiResult.data)
        ? aiResult.data
        : aiResult;

    // Validate AI assessment.
    if (
      !assessment ||
      !Number.isFinite(Number(assessment.risk_score)) ||
      Number(assessment.risk_score) < 0 ||
      Number(assessment.risk_score) > 100 ||
      !['low', 'medium', 'high'].includes(
        assessment.severity
      )
    ) {
      console.error(
        '[Admin Fraud] Invalid AI assessment received:',
        JSON.stringify(aiResult)
      );

      throw new ApiError(
        502,
        'AI fraud service returned an invalid assessment.'
      );
    }

    const riskScore = Number(assessment.risk_score);

    const validSignals = Array.isArray(assessment.signals)
      ? assessment.signals
          .filter(
            (signal) =>
              signal &&
              typeof signal.type === 'string' &&
              typeof signal.message === 'string' &&
              Number.isFinite(Number(signal.points))
          )
          .map((signal) => ({
            type: signal.type,
            points: Math.min(
              100,
              Math.max(0, Number(signal.points))
            ),
            message: signal.message,
          }))
      : [];

    const rawDeviation = Number(
      assessment.price_deviation_percent
    );

    // 7. Save report. Every analysis creates a history record.
    const report = await FraudReport.create({
      property_id: property._id,
      owner_id: property.owner_id._id,

      risk_score: riskScore,
      severity: assessment.severity,
      is_suspicious: Boolean(assessment.is_suspicious),

      signals: validSignals,

      price_deviation_percent:
        Number.isFinite(rawDeviation)
          ? Math.max(0, rawDeviation)
          : null,

      recommendation: assessment.recommendation || '',

      engine:
        assessment.engine ||
        'landestatex_explainable_fraud_rules',

      data_quality:
        assessment.data_quality ||
        'rule_based_heuristic',

      disclaimer:
        assessment.disclaimer ||
        'Automated risk assessment is not proof of fraud. Admin review is required.',
    });

    // 8. Return saved report.
    return res.status(201).json(
      new ApiResponse(
        true,
        'AI fraud analysis completed and report saved successfully.',
        {
          report,

          property: {
            property_id: property._id,
            title: property.title,
            owner_id: property.owner_id._id,
            owner_name: property.owner_id.full_name,
            price: property.price,
            city: property.location?.city || '',
            locality: property.location?.locality || '',
          },

          analysis_context: {
            owner_listings_today: ownerListingsToday,
            max_listings_per_day: maxListingsPerDay,

            price_deviation_threshold_percent:
              priceDeviationThreshold,

            market_median_price_per_sqft:
              marketMedianPricePerSqft,

            market_snapshot_month:
              marketSnapshot?.month || null,

            market_benchmark_source: marketSnapshot
              ? marketSnapshot.locality_key
                ? 'locality_price_history'
                : 'city_price_history'
              : 'unavailable',
          },

          admin_review_required: true,
        }
      )
    );
  }
);

// ---------------------------------------------
// GET ALL FRAUD REPORTS
// GET /api/v1/admin/fraud/reports
// ---------------------------------------------
const getFraudReports = asyncHandler(
  async (req, res) => {
    const {
      review_status,
      severity,
      is_suspicious,
    } = req.query;

    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 20)
    );

    const filter = {};

    // Validate review status.
    if (review_status) {
      const allowedStatuses = [
        'pending',
        'reviewed',
        'confirmed',
        'dismissed',
      ];

      if (!allowedStatuses.includes(review_status)) {
        throw new ApiError(
          400,
          'Invalid review_status filter.'
        );
      }

      filter.review_status = review_status;
    }

    // Validate severity.
    if (severity) {
      const allowedSeverities = [
        'low',
        'medium',
        'high',
      ];

      if (!allowedSeverities.includes(severity)) {
        throw new ApiError(
          400,
          'Invalid severity filter.'
        );
      }

      filter.severity = severity;
    }

    // Optional suspicious filter.
    if (is_suspicious !== undefined) {
      if (!['true', 'false'].includes(is_suspicious)) {
        throw new ApiError(
          400,
          'is_suspicious must be true or false.'
        );
      }

      filter.is_suspicious = is_suspicious === 'true';
    }

    const skip = (page - 1) * limit;

    const [reports, totalReports] = await Promise.all([
      FraudReport.find(filter)
        .populate('property_id', 'title price status location')
        .populate('owner_id', 'full_name email role status')
        .populate('reviewed_by', 'full_name email')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      FraudReport.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalReports / limit);

    return res.status(200).json(
      new ApiResponse(
        true,
        'Fraud reports fetched successfully.',
        {
          reports,

          pagination: {
            current_page: page,
            per_page: limit,
            total_reports: totalReports,
            total_pages: totalPages,
            has_next_page: page < totalPages,
            has_previous_page: page > 1,
          },

          filters: {
            review_status: review_status || null,
            severity: severity || null,
            is_suspicious:
              is_suspicious === undefined
                ? null
                : is_suspicious === 'true',
          },
        }
      )
    );
  }
);

// ---------------------------------------------
// REVIEW A FRAUD REPORT
// PATCH /api/v1/admin/fraud/reports/:reportId/review
// ---------------------------------------------
const reviewFraudReport = asyncHandler(
  async (req, res) => {
    const { reportId } = req.params;

    if (!mongoose.isValidObjectId(reportId)) {
      throw new ApiError(400, 'Invalid fraud report ID.');
    }

    const {
      review_status,
      admin_notes,
    } = req.body || {};

    const allowedStatuses = [
      'reviewed',
      'confirmed',
      'dismissed',
    ];

    if (!allowedStatuses.includes(review_status)) {
      throw new ApiError(
        400,
        'review_status must be reviewed, confirmed, or dismissed.'
      );
    }

    if (
      admin_notes !== undefined &&
      typeof admin_notes !== 'string'
    ) {
      throw new ApiError(
        400,
        'admin_notes must be a string.'
      );
    }

    if (
      typeof admin_notes === 'string' &&
      admin_notes.length > 2000
    ) {
      throw new ApiError(
        400,
        'Admin notes cannot exceed 2000 characters.'
      );
    }

    if (!req.user || !req.user._id) {
      throw new ApiError(
        401,
        'Authenticated admin information is unavailable.'
      );
    }

    const report = await FraudReport.findById(reportId);

    if (!report) {
      throw new ApiError(
        404,
        'Fraud report not found.'
      );
    }

    report.review_status = review_status;
    report.reviewed_by = req.user._id;
    report.reviewed_at = new Date();

    if (admin_notes !== undefined) {
      report.admin_notes = admin_notes.trim();
    }

    await report.save();

    const updatedReport = await FraudReport.findById(
      report._id
    )
      .populate('property_id', 'title price status location')
      .populate('owner_id', 'full_name email role status')
      .populate('reviewed_by', 'full_name email')
      .lean();

    return res.status(200).json(
      new ApiResponse(
        true,
        'Fraud report review updated successfully.',
        {
          report: updatedReport,
        }
      )
    );
  }
);

// ---------------------------------------------
// EXPORT CONTROLLERS
// ---------------------------------------------
module.exports = {
  analysePropertyFraudForAdmin,
  getFraudReports,
  reviewFraudReport,
};
