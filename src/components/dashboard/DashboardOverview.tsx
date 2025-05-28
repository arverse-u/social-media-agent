
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { getContentItems, getPublishRecords, getPlatforms } from '@/services/databaseService';
import { Platform, ContentItem, PublishRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell } from 'recharts';

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = React.useState({
    totalContent: 0,
    published: 0,
    scheduled: 0,
    failed: 0,
    categoryStats: {
      blog: 0,
      feed: 0,
      reel: 0,
    },
    platformStats: {
      hashnode: 0,
      devTo: 0,
      twitter: 0,
      linkedin: 0,
      instagram: 0,
      youtube: 0,
    }
  });

  React.useEffect(() => {
    // Calculate stats from database
    const content = getContentItems();
    const records = getPublishRecords();
    const platforms = getPlatforms();
    
    const platformCounts = records.reduce((acc: Record<string, number>, record: PublishRecord) => {
      if (record.status === 'published') {
        acc[record.platform] = (acc[record.platform] || 0) + 1;
      }
      return acc;
    }, {});

    setStats({
      totalContent: content.length,
      published: content.filter(c => c.publishStatus === 'published').length,
      scheduled: content.filter(c => c.publishStatus === 'scheduled').length,
      failed: content.filter(c => c.publishStatus === 'failed').length,
      categoryStats: {
        blog: content.filter(c => c.category === 'blog').length,
        feed: content.filter(c => c.category === 'feed').length,
        reel: content.filter(c => c.category === 'reel').length,
      },
      platformStats: {
        hashnode: platformCounts['hashnode'] || 0,
        devTo: platformCounts['devTo'] || 0,
        twitter: platformCounts['twitter'] || 0,
        linkedin: platformCounts['linkedin'] || 0,
        instagram: platformCounts['instagram'] || 0,
        youtube: platformCounts['youtube'] || 0,
      },
    });
  }, []);

  const pieData = [
    { name: 'Blogs', value: stats.categoryStats.blog, color: '#4361EE' },
    { name: 'Feeds', value: stats.categoryStats.feed, color: '#3A0CA3' },
    { name: 'Reels', value: stats.categoryStats.reel, color: '#4CC9F0' }
  ];

  const platformData = Object.entries(stats.platformStats)
    .map(([platform, count]) => ({ platform, count }))
    .filter(item => item.count > 0);

  // Generate weekly data for the last 7 days
  const generateWeeklyData = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return dates.map(date => ({
      date,
      Blogs: Math.floor(Math.random() * 10) + 1,
      Feeds: Math.floor(Math.random() * 15) + 5,
      Reels: Math.floor(Math.random() * 8) + 2,
    }));
  };

  const weeklyData = generateWeeklyData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Dashboard</h2>
        <div className="flex space-x-2">
          <Button 
            className="bg-astrum-purple hover:bg-astrum-purple/80"
            onClick={() => navigate('/content')}
          >
            Create Content
          </Button>
          <Button 
            variant="outline" 
            className="border-astrum-purple/60 text-astrum-teal hover:bg-astrum-purple/20"
            onClick={() => navigate('/content-sync')}
          >
            Auto Upload
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Total Content</CardTitle>
            <CardDescription>All content in your library</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-white">{stats.totalContent}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Published</CardTitle>
            <CardDescription>Successfully published</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-astrum-teal">{stats.published}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Scheduled</CardTitle>
            <CardDescription>Scheduled for publishing</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-astrum-blue">{stats.scheduled}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Failed</CardTitle>
            <CardDescription>Failed publish attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-500">{stats.failed}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card/80 backdrop-blur-sm border-border lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>Publishing activity across categories</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#4361EE] mr-1"></div>
                <span className="text-xs text-muted-foreground">Blogs</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#3A0CA3] mr-1"></div>
                <span className="text-xs text-muted-foreground">Feeds</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#4CC9F0] mr-1"></div>
                <span className="text-xs text-muted-foreground">Reels</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#161A30',
                      borderColor: '#3A0CA3',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="Blogs" fill="#4361EE" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Feeds" fill="#3A0CA3" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Reels" fill="#4CC9F0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle>Content Distribution</CardTitle>
            <CardDescription>Content by category</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.totalContent > 0 ? (
              <div className="flex flex-col items-center">
                <div className="h-48 w-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={70}
                        innerRadius={30}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} items`, 'Count']}
                        contentStyle={{ 
                          backgroundColor: '#161A30',
                          borderColor: '#3A0CA3',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 w-full mt-4 gap-2">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex flex-col items-center">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-1"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-lg font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No content data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
            <CardDescription>Published content by platform</CardDescription>
          </CardHeader>
          <CardContent>
            {platformData.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(stats.platformStats).map(([platform, count]) => {
                  if (count === 0) return null;
                  
                  // Get colors for each platform
                  const getColor = () => {
                    switch(platform) {
                      case 'hashnode': return '#2962FF';
                      case 'devTo': return '#000000';
                      case 'twitter': return '#1DA1F2';
                      case 'linkedin': return '#0A66C2';
                      case 'instagram': return '#E4405F';
                      case 'youtube': return '#FF0000';
                      default: return '#888';
                    }
                  };
                  
                  // Get proper name for each platform
                  const getName = () => {
                    switch(platform) {
                      case 'hashnode': return 'Hashnode';
                      case 'devTo': return 'Dev.to';
                      case 'twitter': return 'Twitter/X';
                      case 'linkedin': return 'LinkedIn';
                      case 'instagram': return 'Instagram';
                      case 'youtube': return 'YouTube';
                      default: return platform;
                    }
                  };
                  
                  return (
                    <div className="space-y-2" key={platform}>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{getName()}</span>
                        <span className="text-sm text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full" 
                          style={{ 
                            width: `${stats.totalContent ? (count / stats.totalContent) * 100 : 0}%`,
                            backgroundColor: getColor()
                          }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">No platform data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest content performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#161A30',
                      borderColor: '#3A0CA3',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Blogs" stroke="#4361EE" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Feeds" stroke="#3A0CA3" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Reels" stroke="#4CC9F0" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
