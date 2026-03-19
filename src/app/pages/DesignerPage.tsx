import React from 'react';
import { OpenAPIDesigner } from '../components/openapi-designer';

export function DesignerPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <OpenAPIDesigner
        defaultLocale="zh"
        defaultTheme="light"
        onChange={(doc) => {
          // console.log('Document changed:', doc.info.title);
        }}
      />
    </div>
  );
}
