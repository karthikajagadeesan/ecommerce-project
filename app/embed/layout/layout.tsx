import React from 'react';

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="s22-embed-wrapper min-h-screen bg-transparent">
      {children}
    </div>
  );
}
