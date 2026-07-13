import PropTypes from 'prop-types';

const VARIANT_CLASSES = {
  primary:
    'bg-primary-700 text-white hover:bg-primary-900 shadow-sm hover:shadow-md',
  secondary:
    'border-1.5 border-primary-700 text-primary-700 bg-transparent hover:bg-primary-100',
  accent:
    'bg-accent-600 text-primary-900 hover:brightness-95 shadow-sm hover:shadow-md',
  ghost: 'text-primary-700 hover:bg-primary-100',
};

const SIZE_CLASSES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  as: Component = 'button',
  ...props
}) => {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium
        transition-all duration-200 ease-out active:scale-[0.98] disabled:opacity-40
        disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'accent', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  as: PropTypes.elementType,
};

export default Button;