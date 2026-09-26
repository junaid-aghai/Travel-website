import './Skeleton.css';

/**
 * Animated skeleton loading placeholder.
 * @param {{ width?: string, height?: string, borderRadius?: string, className?: string }} props
 */
export const Skeleton = ({ width = '100%', height = '20px', borderRadius = '8px', className = '' }) => (
  <div
    className={`skeleton-pulse ${className}`}
    style={{ width, height, borderRadius }}
    aria-hidden="true"
  />
);

/**
 * Skeleton card matching the DestinationCard layout for consistent loading UX.
 */
export const DestinationCardSkeleton = () => (
  <div className="skeleton-card" aria-hidden="true">
    <Skeleton height="220px" borderRadius="16px 16px 0 0" />
    <div className="skeleton-card-body">
      <Skeleton width="60%" height="14px" />
      <Skeleton width="100%" height="12px" />
      <Skeleton width="85%" height="12px" />
      <div className="skeleton-row">
        <Skeleton width="70px" height="24px" borderRadius="6px" />
        <Skeleton width="90px" height="12px" />
      </div>
      <div className="skeleton-row">
        <Skeleton width="100px" height="24px" />
        <Skeleton width="80px" height="36px" borderRadius="12px" />
      </div>
    </div>
  </div>
);
