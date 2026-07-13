import PropTypes from 'prop-types';
import { useInView } from '../../hooks/useInView';

const SectionHeading = ({ eyebrow, title, subtitle, align = 'center' }) => {
  const [ref, isInView] = useInView();

  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div
      ref={ref}
      className={`max-w-2xl ${alignClass} transition-all duration-700 ease-out
        ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      {eyebrow && (
        <span className="mb-3 inline-block rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-600">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-semibold text-neutral-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-base text-neutral-500">{subtitle}</p>}
    </div>
  );
};

SectionHeading.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  align: PropTypes.oneOf(['center', 'left']),
};

export default SectionHeading;