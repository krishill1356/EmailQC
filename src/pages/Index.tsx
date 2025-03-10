
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, CheckCircle, XCircle, AlertTriangle, Mail, ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getValidationHistory } from '@/services/emailValidation';
import MainLayout from '@/components/layout/MainLayout';

const Index = () => {
  const [recentValidations, setRecentValidations] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({
    total: 0,
    passing: 0,
    failing: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const history = await getValidationHistory();
        
        // Calculate statistics
        const total = history.length;
        const passing = history.filter(item => item.result.isValid).length;
        const failing = total - passing;
        const avgScore = total > 0 
          ? Math.round(history.reduce((sum, item) => sum + item.result.score, 0) / total) 
          : 0;
        
        setStats({ total, passing, failing, avgScore });
        
        // Get most recent validations (up to 5)
        setRecentValidations(history.slice(-5).reverse());
        
      } catch (error) {
        console.error('Error fetching validation history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const truncateEmail = (email: string, maxLength = 50) => {
    if (email.length <= maxLength) return email;
    return email.substring(0, maxLength) + '...';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Air Travel Claim QC Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Quality check emails before sending to clients and airlines
            </p>
          </div>
          <Button asChild>
            <Link to="/validate">
              Check New Email <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {/* Dashboard Stats */}
        <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Emails Checked</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <span className="animate-pulse">...</span> : stats.total}
              </div>
              <p className="text-xs text-muted-foreground">
                All-time email quality checks
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Passing QC</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? <span className="animate-pulse">...</span> : stats.passing}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? `${Math.round((stats.passing / stats.total) * 100)}% of total` : '0% of total'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Needs Improvement</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {loading ? <span className="animate-pulse">...</span> : stats.failing}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? `${Math.round((stats.failing / stats.total) * 100)}% of total` : '0% of total'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(stats.avgScore)}`}>
                {loading ? <span className="animate-pulse">...</span> : stats.avgScore}
              </div>
              <p className="text-xs text-muted-foreground">
                Out of 100 points
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Validations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Email Checks</CardTitle>
            <CardDescription>
              Your most recent email quality reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : recentValidations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2 text-left font-medium">Email Preview</th>
                      <th className="pb-2 text-center font-medium">Status</th>
                      <th className="pb-2 text-center font-medium">Score</th>
                      <th className="pb-2 text-right font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentValidations.map((validation, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3 text-left">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            {truncateEmail(validation.email)}
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          {validation.result.isValid ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Needs Work
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <span className={getScoreColor(validation.result.score)}>
                            {validation.result.score}/100
                          </span>
                        </td>
                        <td className="py-3 text-right text-gray-500">
                          {new Date(validation.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No email QC history yet.</p>
                <p className="mt-2">
                  <Link to="/validate" className="text-blue-600 hover:underline">
                    Start checking emails
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Get Started Box (for new users) */}
        {stats.total === 0 && !loading && (
          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold">Welcome to Air Travel Claim Email QC!</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Start by checking your first email to ensure it meets quality standards for structure, tone, clarity, and completeness before sending to clients.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/validate">
                    Check Your First Email <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;
