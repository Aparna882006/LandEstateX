
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const Lead = require('../models/Lead.model');

const ALLOWED_STATUSES = [
  'new',
  'contacted',
  'qualified',
  'converted',
  'lost',
];

// GET /leads/me
const getMyLeads = asyncHandler(async (req, res) => {
  const filter = {
    broker_id: req.user.id,
  };

  const { status, search } = req.query;

  if (status) {
    if (!ALLOWED_STATUSES.includes(status)) {
      throw new ApiError(400, 'Invalid lead status');
    }

    filter.status = status;
  }

  let leads = await Lead.find(filter)
    .populate('buyer_id', 'full_name email phone_number')
    .populate(
      'property_id',
      'title price property_type listing_type location images'
    )
    .sort({ created_at: -1 })
    .lean();

  if (search && search.trim()) {
    const term = search.trim().toLowerCase();

    leads = leads.filter((lead) => {
      const buyer = lead.buyer_id || {};
      const property = lead.property_id || {};

      return (
        (buyer.full_name || '').toLowerCase().includes(term) ||
        (buyer.email || '').toLowerCase().includes(term) ||
        (property.title || '').toLowerCase().includes(term)
      );
    });
  }

  return res.status(200).json(
    new ApiResponse(true, 'Leads fetched successfully', {
      leads,
      total_count: leads.length,
    })
  );
});

// PATCH /leads/:lead_id
const updateLead = asyncHandler(async (req, res) => {
  const { lead_id } = req.params;
  const { status, notes } = req.body;

  if (!mongoose.isValidObjectId(lead_id)) {
    throw new ApiError(400, 'Invalid lead ID');
  }

  if (status === undefined && notes === undefined) {
    throw new ApiError(400, 'Provide status or notes to update');
  }

  if (
    status !== undefined &&
    !ALLOWED_STATUSES.includes(status)
  ) {
    throw new ApiError(400, 'Invalid lead status');
  }

  if (
    notes !== undefined &&
    (typeof notes !== 'string' || notes.length > 2000)
  ) {
    throw new ApiError(400, 'Notes must be at most 2000 characters');
  }

  const lead = await Lead.findOne({
    _id: lead_id,
    broker_id: req.user.id,
  });

  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }

  if (status !== undefined) {
    lead.status = status;

    if (status === 'contacted' && !lead.last_contacted_at) {
      lead.last_contacted_at = new Date();
    }
  }

  if (notes !== undefined) {
    lead.notes = notes.trim();
  }

  await lead.save();

  await lead.populate([
    { path: 'buyer_id', select: 'full_name email phone_number' },
    {
      path: 'property_id',
      select: 'title price property_type listing_type location images',
    },
  ]);

  return res.status(200).json(
    new ApiResponse(true, 'Lead updated successfully', { lead })
  );
});

module.exports = {
  getMyLeads,
  updateLead,
};
