import PropTypes from 'prop-types';

const TONE_CLASSES = {
  success: 'bg-success-600/10 text-success-600',
  warning: 'bg-warning-600/10 text-warning-600',
  danger: 'bg-danger-600/10 text-danger-600',
  info: 'bg-info-600/10 text-info-600',
  accent: 'bg-accent-100 text-accent-600',
  neutral: 'bg-neutral-100 text-neutral-500',
};

const Badge = ({ children, tone = 'accent', icon }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}
  >
    {icon}
    {children}
  </span>
);

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  tone: PropTypes.oneOf(['success', 'warning', 'danger', 'info', 'accent', 'neutral']),
  icon: PropTypes.node,
};

export default Badge;