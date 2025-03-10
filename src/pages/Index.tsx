
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, PieChart, CheckCircle, XCircle, AlertTriangle, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getValidationHistory } from '@/services/emailValidation';
import MainLayout from '@/components/layout/MainLayout';

const Index = () => {
  const [recentValidations, setRecentValidations] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({
    total: 0,
    valid: 0,
    invalid: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const history = await getValidationHistory();
        
        // Calculate statistics
        const total = history.length;
        const valid = history.filter(item => item.result.isValid).length;
        const invalid = total - valid;
        const avgScore = total > 0 
          ? Math.round(history.reduce((sum, item) => sum + item.result.score, 0) / total) 
          : 0;
        
        setStats({ total, valid, invalid, avgScore });
        
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
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Email QC Dashboard</h1>
          <Button asChild>
            <Link to="/validate">
              Validate New Email <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {/* Dashboard Stats */}
        <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Validations</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <span className="animate-pulse">...</span> : stats.total}
              </div>
              <p className="text-xs text-muted-foreground">
                All-time validations
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Valid Emails</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? <span className="animate-pulse">...</span> : stats.valid}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? `${Math.round((stats.valid / stats.total) * 100)}% of total` : '0% of total'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Invalid Emails</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {loading ? <span className="animate-pulse">...</span> : stats.invalid}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? `${Math.round((stats.invalid / stats.total) * 100)}% of total` : '0% of total'}
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
            <CardTitle>Recent Validations</CardTitle>
            <CardDescription>
              Your most recent email quality checks
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
                      <th className="pb-2 text-left font-medium">Email</th>
                      <th className="pb-2 text-center font-medium">Status</th>
                      <th className="pb-2 text-center font-medium">Score</th>
                      <th className="pb-2 text-right font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentValidations.map((validation, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3 text-left">{validation.email}</td>
                        <td className="py-3 text-center">
                          {validation.result.isValid ? (
                            <span className="status-badge-success">Valid</span>
                          ) : (
                            <span className="status-badge-error">Invalid</span>
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
                <p>No validation history yet.</p>
                <p className="mt-2">
                  <Link to="/validate" className="text-email-primary hover:underline">
                    Start validating emails
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Get Started Box (for new users) */}
        {stats.total === 0 && !loading && (
          <Card className="bg-gradient-to-br from-email-light to-white">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold">Welcome to Email QC!</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Start by validating your first email to check its quality, deliverability, and compliance with best practices.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/validate">
                    Validate Your First Email <ArrowRight className="ml-2 h-4 w-4" />
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
