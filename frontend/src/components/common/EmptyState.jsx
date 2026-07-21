import PropTypes from 'prop-types';

const EmptyState = ({ icon, title, description, action }) => (
  <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-10 text-center">
    {icon && (
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
        {icon}
      </div>
    )}
    <h3 className="mt-4 text-sm font-semibold text-neutral-900">{title}</h3>
    {description && (
      <p className="mx-auto mt-1 max-w-sm text-xs text-neutral-500">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
};

export default EmptyState;