import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, XCircle, Search, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { getValidationHistory, ValidationResult } from '@/services/emailValidation';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';

interface HistoryItem {
  email: string;
  result: ValidationResult;
  timestamp: string;
}

const ValidationHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredHistory(history);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredHistory(
        history.filter(item => 
          item.email.toLowerCase().includes(term) ||
          (item.result.isValid ? 'valid' : 'invalid').includes(term)
        )
      );
    }
  }, [searchTerm, history]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getValidationHistory();
      const sortedData = data.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setHistory(sortedData);
      setFilteredHistory(sortedData);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load validation history.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('emailValidationHistory');
    setHistory([]);
    setFilteredHistory([]);
    toast({
      title: 'History Cleared',
      description: 'Your validation history has been cleared.',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Validation History</h1>
            <p className="text-muted-foreground mt-2">
              View and manage your past email validations
            </p>
          </div>
          
          {history.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear Validation History</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to clear your validation history? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {}}>Cancel</Button>
                  <Button variant="destructive" onClick={clearHistory}>Clear History</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by email or status..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Validation Records</CardTitle>
            <CardDescription>
              {filteredHistory.length === 0 && !loading
                ? 'No validation history found'
                : `Showing ${filteredHistory.length} ${filteredHistory.length === 1 ? 'record' : 'records'}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center p-8">
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
            ) : filteredHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left font-medium py-3">Email</th>
                      <th className="text-center font-medium py-3">Status</th>
                      <th className="text-center font-medium py-3">Score</th>
                      <th className="text-center font-medium py-3">Date</th>
                      <th className="text-right font-medium py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item, index) => (
                      <tr 
                        key={index} 
                        className="border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                      >
                        <td className="py-3 text-left">{item.email}</td>
                        <td className="py-3 text-center">
                          {item.result.isValid ? (
                            <span className="status-badge-success">Valid</span>
                          ) : (
                            <span className="status-badge-error">Invalid</span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <span className={getScoreColor(item.result.score)}>
                            {item.result.score}/100
                          </span>
                        </td>
                        <td className="py-3 text-center text-gray-500">
                          {formatDate(item.timestamp)}
                        </td>
                        <td className="py-3 text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedItem(item);
                                  }}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                {searchTerm ? (
                  <>
                    <p className="text-lg font-medium">No matching records found</p>
                    <p className="text-muted-foreground mt-1">
                      Try adjusting your search criteria
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium">No validation history yet</p>
                    <p className="text-muted-foreground mt-1">
                      Validated emails will appear here
                    </p>
                    <Button className="mt-4" asChild>
                      <a href="/validate">Validate an Email</a>
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Email Validation Details</DialogTitle>
              <DialogDescription>
                Detailed results for {selectedItem.email}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-4">
              <div className="flex justify-between items-center p-4 rounded-md bg-muted">
                <div>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{selectedItem.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Validation Date</p>
                  <p className="font-medium">{formatDate(selectedItem.timestamp)}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 rounded-md bg-muted">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center mt-1">
                    {selectedItem.result.isValid ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="font-medium text-green-600">Valid</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="font-medium text-red-600">Invalid</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quality Score</p>
                  <p className={`font-medium ${getScoreColor(selectedItem.result.score)}`}>
                    {selectedItem.result.score}/100
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-md bg-muted">
                  <h4 className="font-medium mb-3">Spelling Check</h4>
                  <div className="flex items-center">
                    {selectedItem.result.details.spelling.score > 1.25 ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Good spelling and grammar</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span>Needs spelling improvement</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="p-4 rounded-md bg-muted">
                  <h4 className="font-medium mb-3">Tone Check</h4>
                  <div className="flex items-center">
                    {selectedItem.result.details.tone.score > 1.25 ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Appropriate tone</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span>Tone needs improvement</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="p-4 rounded-md bg-muted">
                  <h4 className="font-medium mb-3">Structure Check</h4>
                  <div className="flex items-center">
                    {selectedItem.result.details.structure.score > 1.25 ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Good structure</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span>Structure needs improvement</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="p-4 rounded-md bg-muted">
                  <h4 className="font-medium mb-3">Template Consistency</h4>
                  <div className="flex items-center">
                    {selectedItem.result.details.similarity.score > 1.25 ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Consistent with templates</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span>Inconsistent with templates</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedItem.result.suggestions && selectedItem.result.suggestions.length > 0 && (
                <div className="p-4 rounded-md bg-muted">
                  <h4 className="font-medium mb-3">Suggestions</h4>
                  <ul className="space-y-2">
                    {selectedItem.result.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <Info className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button onClick={() => setSelectedItem(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
};

export default ValidationHistory;
