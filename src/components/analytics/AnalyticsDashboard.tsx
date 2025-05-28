
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { getContentItems, getPublishRecords, getPlatforms } from '@/services/databaseService';
import { Platform, ContentItem } from '@/types';

// Sample data - in a real app this would come from API calls to each platform
const articlePerformanceData = [
  { date: 'Jan 1', Hashnode: 30, DevTo: 20 },
  { date: 'Jan 8', Hashnode: 33, DevTo: 25 },
  { date: 'Jan 15', Hashnode: 40, DevTo: 30 },
  { date: 'Jan 22', Hashnode: 45, DevTo: 35 },
  { date: 'Jan 29', Hashnode: 48, DevTo: 40 },
  { date: 'Feb 5', Hashnode: 52, DevTo: 45 },
  { date: 'Feb 12', Hashnode: 55, DevTo: 50 }
];

const feedPerformanceData = [
  { date: 'Jan 1', Twitter: 120, LinkedIn: 80, Instagram: 150 },
  { date: 'Jan 8', Twitter: 130, LinkedIn: 85, Instagram: 160 },
  { date: 'Jan 15', Twitter: 125, LinkedIn: 95, Instagram: 175 },
  { date: 'Jan 22', Twitter: 140, LinkedIn: 105, Instagram: 190 },
  { date: 'Jan 29', Twitter: 155, LinkedIn: 110, Instagram: 200 },
  { date: 'Feb 5', Twitter: 145, LinkedIn: 115, Instagram: 215 },
  { date: 'Feb 12', Twitter: 160, LinkedIn: 125, Instagram: 230 }
];

const videoPerformanceData = [
  { date: 'Jan 1', YouTube: 80 },
  { date: 'Jan 8', YouTube: 95 },
  { date: 'Jan 15', YouTube: 110 },
  { date: 'Jan 22', YouTube: 125 },
  { date: 'Jan 29', YouTube: 140 },
  { date: 'Feb 5', YouTube: 160 },
  { date: 'Feb 12', YouTube: 185 }
];

const articleEngagementData = [
  { date: 'Jan 1', Views: 120, Reads: 85, Comments: 12 },
  { date: 'Jan 8', Views: 132, Reads: 90, Comments: 15 },
  { date: 'Jan 15', Views: 141, Reads: 94, Comments: 20 },
  { date: 'Jan 22', Views: 154, Reads: 108, Comments: 18 },
  { date: 'Jan 29', Views: 162, Reads: 115, Comments: 22 },
  { date: 'Feb 5', Views: 175, Reads: 125, Comments: 25 },
  { date: 'Feb 12', Views: 185, Reads: 140, Comments: 30 }
];

const feedEngagementData = [
  { date: 'Jan 1', Views: 350, Likes: 120, Shares: 45 },
  { date: 'Jan 8', Views: 370, Likes: 135, Shares: 50 },
  { date: 'Jan 15', Views: 395, Likes: 150, Shares: 55 },
  { date: 'Jan 22', Views: 420, Likes: 165, Shares: 60 },
  { date: 'Jan 29', Views: 445, Likes: 180, Shares: 65 },
  { date: 'Feb 5', Views: 470, Likes: 195, Shares: 70 },
  { date: 'Feb 12', Views: 495, Likes: 210, Shares: 75 }
];

const videoEngagementData = [
  { date: 'Jan 1', Views: 200, Likes: 50, Comments: 20, Shares: 10 },
  { date: 'Jan 8', Views: 220, Likes: 55, Comments: 25, Shares: 12 },
  { date: 'Jan 15', Views: 240, Likes: 60, Comments: 30, Shares: 15 },
  { date: 'Jan 22', Views: 260, Likes: 65, Comments: 35, Shares: 18 },
  { date: 'Jan 29', Views: 280, Likes: 70, Comments: 40, Shares: 20 },
  { date: 'Feb 5', Views: 300, Likes: 75, Comments: 45, Shares: 22 },
  { date: 'Feb 12', Views: 320, Likes: 80, Comments: 50, Shares: 25 }
];

const articleTopContent = [
  { id: 1, title: 'Building Microservices with Node.js', views: 450, reads: 320, reactions: 85 },
  { id: 2, title: 'React Performance Optimization', views: 380, reads: 285, reactions: 72 },
  { id: 3, title: 'GraphQL vs REST', views: 320, reads: 240, reactions: 68 },
  { id: 4, title: 'Modern CSS Techniques', views: 280, reads: 210, reactions: 56 },
  { id: 5, title: 'Introduction to Web3', views: 250, reads: 180, reactions: 48 }
];

const feedTopContent = [
  { id: 1, title: 'New Web Framework Announcement', views: 1200, likes: 450, shares: 120 },
  { id: 2, title: 'My Journey as a Developer', views: 950, likes: 380, shares: 95 },
  { id: 3, title: 'Tech Stack Comparison', views: 850, likes: 320, shares: 80 },
  { id: 4, title: 'Conference Highlights', views: 720, likes: 290, shares: 75 },
  { id: 5, title: 'Product Launch Teaser', views: 680, likes: 270, shares: 70 }
];

const videoTopContent = [
  { id: 1, title: 'Tutorial: Full-stack App with React', views: 2500, likes: 520, comments: 180 },
  { id: 2, title: 'Code Review Sessions: Best Practices', views: 1800, likes: 420, comments: 150 },
  { id: 3, title: 'Live Coding: Building an API', views: 1500, likes: 380, comments: 120 },
  { id: 4, title: 'Dev Environment Setup', views: 1200, likes: 320, comments: 110 },
  { id: 5, title: 'Database Performance Tuning', views: 950, likes: 280, comments: 95 }
];

const AnalyticsDashboard = () => {
  const [selectedCategory, setSelectedCategory] = React.useState('blog');
  const [platforms, setPlatforms] = React.useState<Platform[]>([]);
  
  const [stats, setStats] = React.useState({
    blog: {
      content: 0,
      published: 0,
      views: 950,
      reactions: 215
    },
    feed: {
      content: 0,
      published: 0,
      views: 2350,
      interactions: 850
    },
    reel: {
      content: 0,
      published: 0,
      views: 895,
      engagements: 320
    }
  });

  React.useEffect(() => {
    // Load platforms
    const loadedPlatforms = getPlatforms();
    setPlatforms(loadedPlatforms);
    
    // Calculate counts from database
    const content = getContentItems();
    const records = getPublishRecords();
    
    // Group content by category
    const blogContent = content.filter(item => item.category === 'blog');
    const feedContent = content.filter(item => item.category === 'feed');
    const reelContent = content.filter(item => item.category === 'reel');
    
    // Published content by category
    const blogPublished = records.filter(r => 
      r.status === 'published' && 
      content.find(c => c.id === r.contentId)?.category === 'blog'
    );
    
    const feedPublished = records.filter(r => 
      r.status === 'published' && 
      content.find(c => c.id === r.contentId)?.category === 'feed'
    );
    
    const reelPublished = records.filter(r => 
      r.status === 'published' && 
      content.find(c => c.id === r.contentId)?.category === 'reel'
    );
    
    setStats({
      blog: {
        content: blogContent.length,
        published: blogPublished.length,
        views: 950,
        reactions: 215
      },
      feed: {
        content: feedContent.length,
        published: feedPublished.length,
        views: 2350,
        interactions: 850
      },
      reel: {
        content: reelContent.length,
        published: reelPublished.length,
        views: 895,
        engagements: 320
      }
    });
  }, []);

  const renderMetrics = () => {
    switch (selectedCategory) {
      case 'blog':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Blogs</CardTitle>
                <CardDescription>Total blogs</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-white">{stats.blog.content}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Published</CardTitle>
                <CardDescription>Blogs published</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-astrum-teal">{stats.blog.published}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Views</CardTitle>
                <CardDescription>Total blog views</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-astrum-blue">{stats.blog.views.toLocaleString()}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Reactions</CardTitle>
                <CardDescription>Likes, claps, reactions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-astrum-purple">{stats.blog.reactions.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'feed':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Posts</CardTitle>
                <CardDescription>Total social posts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-white">{stats.feed.content}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Published</CardTitle>
                <CardDescription>Posts published</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-astrum-teal">{stats.feed.published}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Views</CardTitle>
                <CardDescription>Total impressions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-astrum-blue">{stats.feed.views.toLocaleString()}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Interactions</CardTitle>
                <CardDescription>Likes, shares, comments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-astrum-purple">{stats.feed.interactions.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'reel':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Reels</CardTitle>
                <CardDescription>Total reels</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-white">{stats.reel.content}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Published</CardTitle>
                <CardDescription>Reels published</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-astrum-teal">{stats.reel.published}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Views</CardTitle>
                <CardDescription>Total reel views</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-astrum-blue">{stats.reel.views.toLocaleString()}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Engagement</CardTitle>
                <CardDescription>Likes, comments, shares</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-astrum-purple">{stats.reel.engagements.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Analytics</h2>
      
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="blog">Blog Analytics</TabsTrigger>
          <TabsTrigger value="feed">Feed Analytics</TabsTrigger>
          <TabsTrigger value="reel">Reel Analytics</TabsTrigger>
        </TabsList>
        
        {renderMetrics()}
        
        <TabsContent value="blog">
          <div className="space-y-6 mt-6">
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle>Blog Platform Performance</CardTitle>
                <CardDescription>
                  Compare blog performance across different platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={articlePerformanceData}>
                      <XAxis dataKey="date" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#161A30',
                          borderColor: '#3A0CA3',
                          color: '#fff'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="Hashnode" stroke="#4361EE" strokeWidth={2} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="DevTo" stroke="#4CC9F0" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Views per platform over time
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle>Blog Engagement</CardTitle>
                <CardDescription>
                  Track how users engage with your blogs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={articleEngagementData}>
                      <XAxis dataKey="date" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#161A30',
                          borderColor: '#3A0CA3',
                          color: '#fff'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="Views" fill="#3A0CA3" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Reads" fill="#4361EE" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Comments" fill="#4CC9F0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Views, reads and comments over time
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle>Top Performing Blogs</CardTitle>
                <CardDescription>
                  Your best performing blogs across platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {articleTopContent.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{item.title}</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-astrum-blue">👁️</span>
                            <span className="text-sm">{item.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-astrum-teal">📖</span>
                            <span className="text-sm">{item.reads}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-astrum-purple">❤️</span>
                            <span className="text-sm">{item.reactions}</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-astrum-purple to-astrum-teal" 
                          style={{ 
                            width: `${(item.views / articleTopContent[0].views) * 100}%` 
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="feed">
          <div className="space-y-6 mt-6">
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle>Feed Platform Performance</CardTitle>
                <CardDescription>
                  Compare social media feed performance across platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={feedPerformanceData}>
                      <XAxis dataKey="date" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#161A30',
                          borderColor: '#3A0CA3',
                          color: '#fff'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="Twitter" stroke="#1DA1F2" strokeWidth={2} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="LinkedIn" stroke="#0A66C2" strokeWidth={2} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Instagram" stroke="#E4405F" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Engagement per platform over time
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle>Feed Engagement</CardTitle>
                <CardDescription>
                  Track how users engage with your social media posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={feedEngagementData}>
                      <XAxis dataKey="date" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#161A30',
                          borderColor: '#3A0CA3',
                          color: '#fff'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="Views" fill="#3A0CA3" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Likes" fill="#4361EE" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Shares" fill="#4CC9F0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Views, likes and shares over time
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle>Top Performing Social Posts</CardTitle>
                <CardDescription>
                  Your best performing social media content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {feedTopContent.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{item.title}</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-astrum-blue">👁️</span>
                            <span className="text-sm">{item.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-astrum-teal">👍</span>
                            <span className="text-sm">{item.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-astrum-purple">🔄</span>
                            <span className="text-sm">{item.shares}</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-astrum-purple to-astrum-teal" 
                          style={{ 
                            width: `${(item.views / feedTopContent[0].views) * 100}%` 
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reel">
          <div className="space-y-6 mt-6">
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle>Reel Platform Performance</CardTitle>
                <CardDescription>
                  Track reel performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={videoPerformanceData}>
                      <XAxis dataKey="date" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#161A30',
                          borderColor: '#3A0CA3',
                          color: '#fff'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="YouTube" stroke="#FF0000" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Views over time
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle>Reel Engagement</CardTitle>
                <CardDescription>
                  Track how users engage with your reels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={videoEngagementData}>
                      <XAxis dataKey="date" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#161A30',
                          borderColor: '#3A0CA3',
                          color: '#fff'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="Views" fill="#3A0CA3" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Likes" fill="#4361EE" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Comments" fill="#4CC9F0" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Shares" fill="#F72585" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Views, likes, comments and shares over time
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle>Top Performing Reels</CardTitle>
                <CardDescription>
                  Your best performing reels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {videoTopContent.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{item.title}</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-astrum-blue">👁️</span>
                            <span className="text-sm">{item.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-astrum-teal">👍</span>
                            <span className="text-sm">{item.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-astrum-purple">💬</span>
                            <span className="text-sm">{item.comments}</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-astrum-purple to-astrum-teal" 
                          style={{ 
                            width: `${(item.views / videoTopContent[0].views) * 100}%` 
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
