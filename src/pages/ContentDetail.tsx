
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ContentDetailComponent from '@/components/content/ContentDetail';

const ContentDetail = () => {
  const { id } = useParams();
  
  return (
    <Layout>
      <ContentDetailComponent contentId={id} />
    </Layout>
  );
};

export default ContentDetail;
