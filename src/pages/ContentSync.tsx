
import React from 'react';
import Layout from '@/components/layout/Layout';
import AutomaticUpload from '@/components/content/AutomaticUpload';

const ContentSync = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Sync</h1>
          <p className="text-muted-foreground">Manage automatic content uploads and processing</p>
        </div>
        
        <AutomaticUpload />
      </div>
    </Layout>
  );
};

export default ContentSync;
