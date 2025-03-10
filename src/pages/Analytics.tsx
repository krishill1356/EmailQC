
import React, { useState, useEffect } from 'react';
import { BarChart as BarChartIcon, PieChart as PieChartIcon, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getValidationHistory } from '@/services/emailValidation';
import MainLayout from '@/components/layout/MainLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

interface HistoryItem {
  email: string;
  result: any;
  timestamp: string;
}

const Analytics = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [barData, setBarData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [domainData, setDomainData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getValidationHistory();
      setHistory(data);
      
      // Process data for charts
      processDataForCharts(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const processDataForCharts = (data: HistoryItem[]) => {
    // Score distribution data for bar chart
    const scoreRanges = [
      { name: '0-20', count: 0 },
      { name: '21-40', count: 0 },
      { name: '41-60', count: 0 },
      { name: '61-80', count: 0 },
      { name: '81-100', count: 0 },
    ];
    
    // Validation status data for pie chart
    const statusData = [
      { name: 'Valid', value: 0 },
      { name: 'Invalid', value: 0 },
    ];
    
    // Domain distribution data
    const domains: Record<string, number> = {};
    
    data.forEach(item => {
      // Process score for bar chart
      const score = item.result.score;
      if (score <= 20) scoreRanges[0].count++;
      else if (score <= 40) scoreRanges[1].count++;
      else if (score <= 60) scoreRanges[2].count++;
      else if (score <= 80) scoreRanges[3].count++;
      else scoreRanges[4].count++;
      
      // Process status for pie chart
      if (item.result.isValid) {
        statusData[0].value++;
      } else {
        statusData[1].value++;
      }
      
      // Process domain
      const domain = item.email.split('@')[1];
      if (domain) {
        domains[domain] = (domains[domain] || 0) + 1;
      }
    });
    
    // Convert domains object to array
    const domainArray = Object.entries(domains)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 domains
    
    setBarData(scoreRanges);
    setPieData(statusData);
    setDomainData(domainArray);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="text-xs">{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Visualize and understand your email validation data
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-email-primary mb-4" />
              <p className="text-muted-foreground">Loading analytics data...</p>
            </div>
          </div>
        ) : history.length === 0 ? (
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="text-center py-8">
                <BarChartIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No Data Available</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Validate emails to see analytics and insights here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="scores">Score Analysis</TabsTrigger>
              <TabsTrigger value="domains">Domain Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChartIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                      Validation Status
                    </CardTitle>
                    <CardDescription>
                      Distribution of valid and invalid emails
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#ef4444" />
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChartIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                      Score Distribution
                    </CardTitle>
                    <CardDescription>
                      Quality scores by range
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="count" fill="#0ea5e9">
                            {barData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>
                    Key insights from your validation data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-muted rounded-md p-4">
                      <p className="text-sm text-muted-foreground">Total Validations</p>
                      <p className="text-3xl font-bold mt-1">{history.length}</p>
                    </div>
                    
                    <div className="bg-muted rounded-md p-4">
                      <p className="text-sm text-muted-foreground">Valid Emails</p>
                      <p className="text-3xl font-bold mt-1 text-green-600">
                        {pieData[0].value}
                        <span className="text-sm font-normal ml-2">
                          ({Math.round((pieData[0].value / history.length) * 100)}%)
                        </span>
                      </p>
                    </div>
                    
                    <div className="bg-muted rounded-md p-4">
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-3xl font-bold mt-1 text-email-primary">
                        {Math.round(history.reduce((sum, item) => sum + item.result.score, 0) / history.length)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="scores" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Score Analysis</CardTitle>
                  <CardDescription>
                    Detailed breakdown of quality scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <XAxis dataKey="name" label={{ value: 'Score Range', position: 'bottom', offset: 0 }} />
                        <YAxis label={{ value: 'Number of Emails', angle: -90, position: 'left' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="count" name="Number of Emails" fill="#0ea5e9">
                          {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2 mt-6">
                    {barData.map((range, index) => (
                      <div key={index} className="bg-muted rounded-md p-3 text-center">
                        <p className="text-sm font-medium mb-1">{range.name}</p>
                        <p className="text-2xl font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                          {range.count}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round((range.count / history.length) * 100)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="domains" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Domain Analysis</CardTitle>
                  <CardDescription>
                    Top domains and their validation statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={domainData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {domainData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="overflow-x-auto mt-6">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left font-medium py-3">Domain</th>
                          <th className="text-center font-medium py-3">Emails</th>
                          <th className="text-center font-medium py-3">% of Total</th>
                          <th className="text-center font-medium py-3">Avg. Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {domainData.map((domain, index) => {
                          // Calculate average score for this domain
                          const domainEmails = history.filter(item => item.email.endsWith(domain.name));
                          const avgScore = Math.round(
                            domainEmails.reduce((sum, item) => sum + item.result.score, 0) / domainEmails.length
                          );
                          
                          return (
                            <tr key={index} className="border-b last:border-0">
                              <td className="py-3 text-left">{domain.name}</td>
                              <td className="py-3 text-center">{domain.value}</td>
                              <td className="py-3 text-center">
                                {Math.round((domain.value / history.length) * 100)}%
                              </td>
                              <td className="py-3 text-center">{avgScore}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
};

export default Analytics;
