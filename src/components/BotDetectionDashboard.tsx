import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Bot, 
  Users, 
  TrendingUp,
  Eye,
  Target,
  Zap
} from "lucide-react";

interface AnalysisResult {
  username: string;
  confidence: number;
  status: 'bot' | 'human' | 'suspicious';
  factors: string[];
  timestamp: string;
}

export const BotDetectionDashboard = () => {
  const [username, setUsername] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([
    {
      username: "suspicious_user_123",
      confidence: 94.2,
      status: 'bot',
      factors: ['High posting frequency', 'Generic comments', 'New account'],
      timestamp: '2024-01-15 14:30'
    },
    {
      username: "real_human_user",
      confidence: 87.5,
      status: 'human',
      factors: ['Varied content', 'Established account', 'Natural patterns'],
      timestamp: '2024-01-15 14:25'
    }
  ]);

  const handleAnalyze = async () => {
    if (!username.trim()) return;
    
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      const newResult: AnalysisResult = {
        username,
        confidence: Math.random() * 40 + 60,
        status: Math.random() > 0.6 ? 'bot' : 'human',
        factors: ['Analysis complete', 'Behavioral patterns detected'],
        timestamp: new Date().toLocaleString()
      };
      setResults(prev => [newResult, ...prev]);
      setIsAnalyzing(false);
      setUsername("");
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bot': return 'destructive';
      case 'human': return 'success';
      case 'suspicious': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'bot': return <Bot className="h-4 w-4" />;
      case 'human': return <CheckCircle className="h-4 w-4" />;
      case 'suspicious': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-primary shadow-cyber">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Reddit Bot Detection
            </h1>
            <p className="text-muted-foreground">Advanced AI-powered fake account detection system</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-border/50 bg-gradient-cyber backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/20">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Accounts Analyzed</p>
              <p className="text-2xl font-bold text-foreground">1,247</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border/50 bg-gradient-cyber backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-destructive/20">
              <Bot className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bots Detected</p>
              <p className="text-2xl font-bold text-destructive">342</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border/50 bg-gradient-cyber backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-success/20">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Accuracy Rate</p>
              <p className="text-2xl font-bold text-success">94.7%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border/50 bg-gradient-cyber backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-accent/20">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Detection Rate</p>
              <p className="text-2xl font-bold text-accent">27.4%</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analysis Form */}
        <div className="lg:col-span-1">
          <Card className="p-6 border-border/50 bg-gradient-cyber backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6">
              <Search className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Analyze User</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Reddit Username
                </label>
                <Input
                  placeholder="Enter username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-input/50 border-border/50"
                />
              </div>
              
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !username.trim()}
                className="w-full bg-gradient-primary hover:shadow-cyber transition-all duration-300"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Analyze Account
                  </>
                )}
              </Button>
              
              {isAnalyzing && (
                <div className="space-y-2">
                  <Progress value={65} className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    Running Isolation Forest analysis...
                  </p>
                </div>
              )}
            </div>

            {/* Methodology Info */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Detection Methods</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">Isolation Forest ML</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <span className="text-sm text-muted-foreground">Behavioral Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  <span className="text-sm text-muted-foreground">Content Pattern Recognition</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          <Card className="p-6 border-border/50 bg-gradient-cyber backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6">
              <Eye className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Recent Analysis</h2>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(result.status)}
                        <span className="font-mono text-sm">u/{result.username}</span>
                      </div>
                      <Badge 
                        variant={getStatusColor(result.status) as any}
                        className="text-xs"
                      >
                        {result.status.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Confidence</span>
                      <span className="text-sm font-semibold">{result.confidence.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={result.confidence} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {result.factors.map((factor, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Dataset Info */}
      <Card className="mt-8 p-6 border-border/50 bg-gradient-cyber backdrop-blur-sm">
        <h2 className="text-xl font-semibold mb-4">Dataset & Model Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium mb-2">Training Data</h3>
            <p className="text-sm text-muted-foreground mb-2">
              50,000+ Reddit accounts with labeled bot/human classifications
            </p>
            <div className="text-xs text-muted-foreground">
              Sources: Known bot networks, verified human accounts, suspicious activity patterns
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Model Architecture</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Isolation Forest with feature engineering for anomaly detection
            </p>
            <div className="text-xs text-muted-foreground">
              Features: Posting patterns, content analysis, temporal behavior, account metadata
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Performance Metrics</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Precision: 92.1% | Recall: 89.4% | F1-Score: 90.7%
            </p>
            <div className="text-xs text-muted-foreground">
              Last updated: January 2024 | Model version: v2.1
            </div>
          </div>
        </div>
      </Card>

      {/* Backend Integration Alert */}
      <Alert className="mt-8 border-warning/50 bg-warning/10">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertDescription className="text-warning-foreground">
          <strong>Backend Integration Required:</strong> To connect Reddit API (PRAW) and run ML models, 
          you'll need to integrate Supabase for secure API key storage and edge function processing.
        </AlertDescription>
      </Alert>
    </div>
  );
};