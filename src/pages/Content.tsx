
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import ContentManagement from '@/components/content/ContentManagement';
import PlatformUpload from '@/components/content/PlatformUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const Content = () => {
  const [activeTab, setActiveTab] = useState<"content" | "upload">("content");

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold">Content Management</h1>
        
        <Tabs 
          defaultValue="content" 
          onValueChange={(value) => setActiveTab(value as "content" | "upload")}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-2 h-12 bg-muted/20 rounded-lg p-1">
            <TabsTrigger 
              value="content" 
              className={cn(
                "rounded-md text-sm font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
                "data-[state=active]:shadow-sm h-10",
                "data-[state=active]:text-astrum-purple data-[state=active]:font-semibold"
              )}
            >
              Content Library
            </TabsTrigger>
            <TabsTrigger 
              value="upload"
              className={cn(
                "rounded-md text-sm font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
                "data-[state=active]:shadow-sm h-10",
                "data-[state=active]:text-astrum-purple data-[state=active]:font-semibold"
              )}
            >
              Create New Content
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="pt-6">
            <ContentManagement />
          </TabsContent>
          
          <TabsContent value="upload" className="pt-6">
            <PlatformUpload />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Content;
