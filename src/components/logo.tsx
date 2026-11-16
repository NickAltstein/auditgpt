import Image from 'next/image';

interface LogoProps {
  variant?: 'shield' | 'symbol' | 'full' | 'image';
  className?: string;
  height?: number;
  priority?: boolean;
}

export function Logo({
  variant = 'full',
  className = '',
  height = 28,
  priority = false,
}: LogoProps) {
  const iconSize = Math.max(20, Math.round(height * 1.25));

  if (variant === 'shield' || variant === 'symbol') {
    return (
      <Image
        src="/logo-shield.png"
        alt="AuditGPT"
        width={iconSize}
        height={iconSize}
        priority={priority}
        className={className}
        style={{
          display: 'block',
          flexShrink: 0,
          height: iconSize,
          width: iconSize,
          objectFit: 'contain',
        }}
      />
    );
  }

  if (variant === 'image') {
    return (
      <Image
        src="/logo-full.png"
        alt="AuditGPT"
        width={Math.round(height * 4.5)}
        height={height}
        priority={priority}
        className={className}
        style={{
          display: 'block',
          flexShrink: 0,
          height,
          width: 'auto',
          objectFit: 'contain',
        }}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2.5 ${className}`}
      style={{ height, flexShrink: 0 }}
    >
      <Image
        src="/logo-shield.png"
        alt="AuditGPT"
        width={iconSize}
        height={iconSize}
        priority={priority}
        style={{
          display: 'block',
          flexShrink: 0,
          height: iconSize,
          width: iconSize,
          objectFit: 'contain',
        }}
      />
      <span
        style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontWeight: 600,
          fontSize: Math.max(18, Math.round(height * 0.85)),
          letterSpacing: '-0.02em',
          color: 'inherit',
          whiteSpace: 'nowrap',
          lineHeight: 1,
        }}
      >
        AuditGPT<span style={{ color: 'var(--primary, #0D4F55)', fontSize: '0.9em' }}>.ai</span>
      </span>
    </div>
  );
}
