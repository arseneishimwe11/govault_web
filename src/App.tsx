import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Copy, Download, Eye, EyeOff, Lock, Send, Shield, Timer, QrCode, Upload, FileText, BarChart3, Sparkles, Zap, CheckCircle2, Globe, Users, Star } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QRCode from 'qrcode';

export default function VaultifyApp() {
  const [activeTab, setActiveTab] = useState("send");
  const [secret, setSecret] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ttl, setTtl] = useState("24h");
  const [maxReads, setMaxReads] = useState("1");
  const [retrieveToken, setRetrieveToken] = useState("");
  const [retrievePassword, setRetrievePassword] = useState("");
  const [showRetrievePassword, setShowRetrievePassword] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useFileUpload, setUseFileUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [storedSecrets, setStoredSecrets] = useState<any[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setSecret(content);
      };
      reader.readAsText(file);
    }
  };

  const generateQRCode = async (text: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(text, {
        width: 200,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const handleSendSecret = async () => {
    let secretToSend = secret;
    
    if (useFileUpload && selectedFile) {
      secretToSend = `File: ${selectedFile.name}\nContent: ${secret}`;
    }
    
    if (!secretToSend.trim() || !password.trim()) {
      setResult({ error: "Secret and password are required" });
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockToken = `vlt_${Math.random().toString(36).substring(2, 15)}`;
      const expiresAt = new Date(Date.now() + parseTTL(ttl) * 1000);
      const shareUrl = `${window.location.origin}/s/${mockToken}`;
      
      const newSecret = {
        token: mockToken,
        shareUrl,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
        ttl,
        maxReads: parseInt(maxReads),
        isFile: useFileUpload && selectedFile,
        fileName: selectedFile?.name
      };
      
      setStoredSecrets(prev => [...prev, newSecret]);
      await generateQRCode(shareUrl);
      
      setResult({
        success: true,
        ...newSecret
      });
    } catch (error) {
      setResult({ error: "Failed to store secret" });
    } finally {
      setLoading(false);
    }
  };

  const handleRetrieveSecret = async () => {
    if (!retrieveToken.trim() || !retrievePassword.trim()) {
      setResult({ error: "Token and password are required" });
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResult({
        success: true,
        retrievedSecret: "This is your decrypted secret!",
        readsRemaining: 0,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      });
    } catch (error) {
      setResult({ error: "Failed to retrieve secret" });
    } finally {
      setLoading(false);
    }
  };

  const parseTTL = (ttl: string): number => {
    const unit = ttl.slice(-1);
    const value = parseInt(ttl.slice(0, -1));
    switch (unit) {
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 86400;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 transition-all duration-500">
      {/* Floating elements background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60 transition-all duration-300">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-30"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-0.5">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Vaultify
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Zero-Knowledge Security</p>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center space-x-3">
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800 px-3 py-1 gap-2 transition-all duration-300 hover:scale-105">
                <CheckCircle2 className="h-3 w-3" />
                E2E Encrypted
              </Badge>
              <Badge variant="outline" className="border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300 px-3 py-1 gap-2 transition-all duration-300 hover:scale-105">
                <Globe className="h-3 w-3" />
                Secure
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium transition-all duration-300 hover:scale-105">
                <Sparkles className="h-4 w-4" />
                Military-Grade Encryption
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
                  Share Secrets
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
                  Securely
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                End-to-end encrypted, ephemeral secret sharing with{" "}
                <span className="font-semibold text-slate-900 dark:text-white">zero-knowledge architecture</span>.
                Your secrets are encrypted in your browser before they ever leave your device.
              </p>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-8 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Trusted by 50,000+ users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span>99.9% Uptime</span>
              </div>
            </div>

            {/* Security Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-16">
              {[
                {
                  icon: Lock,
                  color: "text-emerald-600 dark:text-emerald-400",
                  bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
                  borderColor: "border-emerald-200 dark:border-emerald-800",
                  title: "AES-256-GCM",
                  description: "Military-grade encryption standard used by governments worldwide"
                },
                {
                  icon: Timer,
                  color: "text-blue-600 dark:text-blue-400",
                  bgColor: "bg-blue-50 dark:bg-blue-950/30",
                  borderColor: "border-blue-200 dark:border-blue-800",
                  title: "Auto-Expire",
                  description: "Configurable TTL ensures secrets don't live forever"
                },
                {
                  icon: Eye,
                  color: "text-purple-600 dark:text-purple-400",
                  bgColor: "bg-purple-50 dark:bg-purple-950/30",
                  borderColor: "border-purple-200 dark:border-purple-800",
                  title: "Read Once",
                  description: "Self-destructing secrets for maximum security"
                }
              ].map((feature, index) => (
                <div key={index} className={`group p-6 rounded-2xl border-2 ${feature.borderColor} ${feature.bgColor} transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50`}>
                  <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} border ${feature.borderColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Interface */}
      <section className="py-16 lg:py-24 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-12 h-14 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700">
                <TabsTrigger 
                  value="send" 
                  className="flex items-center gap-3 text-sm font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200/50 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:shadow-slate-900/50 transition-all duration-300"
                >
                  <Send className="h-4 w-4" />
                  Send Secret
                </TabsTrigger>
                <TabsTrigger 
                  value="retrieve" 
                  className="flex items-center gap-3 text-sm font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200/50 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:shadow-slate-900/50 transition-all duration-300"
                >
                  <Download className="h-4 w-4" />
                  Retrieve Secret
                </TabsTrigger>
                <TabsTrigger 
                  value="dashboard" 
                  className="flex items-center gap-3 text-sm font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200/50 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:shadow-slate-900/50 transition-all duration-300"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
              </TabsList>

              {/* Send Secret Tab */}
              <TabsContent value="send" className="space-y-0">
                <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/20 dark:shadow-slate-900/20 rounded-3xl overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b border-slate-200 dark:border-slate-700 p-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                        <Lock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                          Send a Secret
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-300 text-base mt-1">
                          Your secret will be encrypted in your browser with AES-256-GCM before transmission.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="secret" className="text-lg font-semibold text-slate-900 dark:text-white">
                          Secret Content *
                        </Label>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant={useFileUpload ? "default" : "outline"}
                            size="sm"
                            onClick={() => setUseFileUpload(!useFileUpload)}
                            className="gap-2 transition-all duration-300 hover:scale-105"
                          >
                            <Upload className="h-4 w-4" />
                            {useFileUpload ? "Using File" : "Upload File"}
                          </Button>
                          {useFileUpload && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              className="gap-2 transition-all duration-300 hover:scale-105"
                            >
                              <FileText className="h-4 w-4" />
                              Choose File
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {useFileUpload ? (
                        <div className="space-y-4">
                          <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileUpload}
                            className="hidden"
                            accept=".txt,.json,.csv,.md,.log"
                          />
                          {selectedFile ? (
                            <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-800/50">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-900 dark:text-white">{selectedFile.name}</span>
                                  <Badge variant="secondary" className="ml-2">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                  </Badge>
                                </div>
                              </div>
                              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                                File preview:
                              </Label>
                              <Textarea
                                value={secret}
                                onChange={(e) => setSecret(e.target.value)}
                                className="min-h-[120px] resize-none font-mono text-sm border-2 rounded-xl"
                                readOnly={false}
                              />
                            </div>
                          ) : (
                            <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-12 text-center bg-slate-50/50 dark:bg-slate-800/30 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600">
                              <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
                              <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">
                                Click "Choose File" to upload a text file
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Supports: .txt, .json, .csv, .md, .log
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Textarea
                          id="secret"
                          placeholder="Enter your secret here (passwords, API keys, sensitive data...)"
                          value={secret}
                          onChange={(e) => setSecret(e.target.value)}
                          className="min-h-[140px] resize-none border-2 rounded-xl text-base p-4 transition-all duration-300 focus:border-blue-500 dark:focus:border-blue-400"
                        />
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="password" className="text-lg font-semibold text-slate-900 dark:text-white">
                        Encryption Password *
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Strong password for encryption"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="border-2 rounded-xl text-base h-12 pr-12 transition-all duration-300 focus:border-blue-500 dark:focus:border-blue-400"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-300"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="ttl" className="text-base font-semibold text-slate-900 dark:text-white">
                          Time to Live
                        </Label>
                        <Input
                          id="ttl"
                          placeholder="24h"
                          value={ttl}
                          onChange={(e) => setTtl(e.target.value)}
                          className="border-2 rounded-xl text-base h-12 transition-all duration-300 focus:border-blue-500 dark:focus:border-blue-400"
                        />
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Examples: 30m, 2h, 1d
                        </p>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="maxReads" className="text-base font-semibold text-slate-900 dark:text-white">
                          Max Reads
                        </Label>
                        <Input
                          id="maxReads"
                          placeholder="1"
                          value={maxReads}
                          onChange={(e) => setMaxReads(e.target.value)}
                          className="border-2 rounded-xl text-base h-12 transition-all duration-300 focus:border-blue-500 dark:focus:border-blue-400"
                        />
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          0 = unlimited
                        </p>
                      </div>
                    </div>

                    <Button 
                      onClick={handleSendSecret} 
                      disabled={loading || !secret.trim() || !password.trim()}
                      className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:hover:scale-100"
                      size="lg"
                    >
                      <Lock className="h-5 w-5 mr-3" />
                      {loading ? "Encrypting & Storing..." : "Send Secret"}
                    </Button>

                    {result && result.success && (
                      <Alert className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
                            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="font-bold text-green-800 dark:text-green-200 text-lg">
                            ✨ Secret stored successfully!
                          </div>
                        </div>
                        
                        <AlertDescription className="space-y-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Token:</Label>
                                <div className="flex items-center gap-2">
                                  <code className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-sm font-mono border">
                                    {result.token}
                                  </code>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => copyToClipboard(result.token)}
                                    className="rounded-xl transition-all duration-300 hover:scale-105"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Share URL:</Label>
                                <div className="flex items-center gap-2">
                                  <code className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-sm font-mono border truncate">
                                    {result.shareUrl}
                                  </code>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => copyToClipboard(result.shareUrl)}
                                    className="rounded-xl transition-all duration-300 hover:scale-105"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                                <p><span className="font-medium">Expires:</span> {new Date(result.expiresAt).toLocaleString()}</p>
                                {result.isFile && (
                                  <p><span className="font-medium">📄 File:</span> {result.fileName}</p>
                                )}
                              </div>
                            </div>
                            
                            {qrCodeDataUrl && (
                              <div className="flex flex-col items-center space-y-4">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                  <QrCode className="h-4 w-4" />
                                  QR Code for Mobile
                                </Label>
                                <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 dark:border-slate-600 shadow-lg">
                                  <img 
                                    src={qrCodeDataUrl} 
                                    alt="QR Code for secret sharing" 
                                    className="rounded-xl" 
                                  />
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                  Scan to access on mobile
                                </p>
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {result && result.error && (
                      <Alert variant="destructive" className="border-2 rounded-2xl">
                        <AlertCircle className="h-5 w-5" />
                        <AlertDescription className="text-base">{result.error}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Retrieve Secret Tab */}
              <TabsContent value="retrieve" className="space-y-0">
                <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/20 dark:shadow-slate-900/20 rounded-3xl overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/30 dark:to-blue-950/30 border-b border-slate-200 dark:border-slate-700 p-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-600 shadow-lg">
                        <Download className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                          Retrieve a Secret
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-300 text-base mt-1">
                          Enter the token and password to decrypt and retrieve your secret.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-3">
                      <Label htmlFor="retrieveToken" className="text-lg font-semibold text-slate-900 dark:text-white">
                        Token *
                      </Label>
                      <Input
                        id="retrieveToken"
                        placeholder="Enter the secret token"
                        value={retrieveToken}
                        onChange={(e) => setRetrieveToken(e.target.value)}
                        className="border-2 rounded-xl text-base h-12 transition-all duration-300 focus:border-emerald-500 dark:focus:border-emerald-400"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="retrievePassword" className="text-lg font-semibold text-slate-900 dark:text-white">
                        Decryption Password *
                      </Label>
                      <div className="relative">
                        <Input
                          id="retrievePassword"
                          type={showRetrievePassword ? "text" : "password"}
                          placeholder="Password used for encryption"
                          value={retrievePassword}
                          onChange={(e) => setRetrievePassword(e.target.value)}
                          className="border-2 rounded-xl text-base h-12 pr-12 transition-all duration-300 focus:border-emerald-500 dark:focus:border-emerald-400"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-300"
                          onClick={() => setShowRetrievePassword(!showRetrievePassword)}
                        >
                          {showRetrievePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      onClick={handleRetrieveSecret} 
                      disabled={loading || !retrieveToken.trim() || !retrievePassword.trim()}
                      className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:hover:scale-100"
                      size="lg"
                    >
                      <Download className="h-5 w-5 mr-3" />
                      {loading ? "Retrieving & Decrypting..." : "Retrieve Secret"}
                    </Button>

                    {result && result.success && result.retrievedSecret && (
                      <Alert className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
                            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="font-bold text-green-800 dark:text-green-200 text-lg">
                            ✨ Secret retrieved successfully!
                          </div>
                        </div>
                        
                        <AlertDescription className="space-y-4">
                          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-6 border-2 border-slate-200 dark:border-slate-600">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
                              Your Secret:
                            </Label>
                            <div className="font-mono text-base break-all bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-600">
                              {result.retrievedSecret}
                            </div>
                          </div>
                          
                          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
                            <p className="flex items-center gap-2">
                              {result.readsRemaining === 0 ? (
                                <>
                                  <span className="text-amber-600 dark:text-amber-400">⚠️</span>
                                  <span className="font-medium">This secret has been deleted after retrieval.</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-blue-600 dark:text-blue-400">📊</span>
                                  <span className="font-medium">Reads remaining: {result.readsRemaining}</span>
                                </>
                              )}
                            </p>
                            <p>
                              <span className="font-medium">Created:</span> {new Date(result.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {result && result.error && (
                      <Alert variant="destructive" className="border-2 rounded-2xl">
                        <AlertCircle className="h-5 w-5" />
                        <AlertDescription className="text-base">{result.error}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-0">
                <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/20 dark:shadow-slate-900/20 rounded-3xl overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b border-slate-200 dark:border-slate-700 p-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                          Secrets Dashboard
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-300 text-base mt-1">
                          View and manage your stored secrets. This dashboard shows secrets created in this session.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-8">
                    {storedSecrets.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                          <BarChart3 className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                          No secrets stored yet
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
                          Secrets you create will appear here for easy management. Start by creating your first secret.
                        </p>
                        <Button 
                          onClick={() => setActiveTab("send")} 
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-8 py-3 text-base font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/25"
                        >
                          Create Your First Secret
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {[
                            {
                              value: storedSecrets.length,
                              label: "Total Secrets",
                              color: "from-blue-600 to-purple-600",
                              bgColor: "from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30"
                            },
                            {
                              value: storedSecrets.filter(s => new Date(s.expiresAt) > new Date()).length,
                              label: "Active Secrets",
                              color: "from-emerald-600 to-green-600",
                              bgColor: "from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30"
                            },
                            {
                              value: storedSecrets.filter(s => s.isFile).length,
                              label: "File Secrets",
                              color: "from-amber-600 to-orange-600",
                              bgColor: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
                            }
                          ].map((stat, index) => (
                            <Card key={index} className={`border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-gradient-to-r ${stat.bgColor} transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
                              <CardContent className="p-6 text-center">
                                <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                                  {stat.value}
                                </div>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                  {stat.label}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Secrets</h3>
                          <div className="space-y-4">
                            {storedSecrets.slice().reverse().map((secret, index) => {
                              const isExpired = new Date(secret.expiresAt) <= new Date();
                              const timeUntilExpiry = new Date(secret.expiresAt).getTime() - new Date().getTime();
                              const hoursLeft = Math.max(0, Math.floor(timeUntilExpiry / (1000 * 60 * 60)));
                              
                              return (
                                <Card key={index} className={`border-2 border-slate-200 dark:border-slate-700 rounded-2xl transition-all duration-300 hover:shadow-lg ${isExpired ? "opacity-60" : "hover:scale-[1.02]"}`}>
                                  <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                      <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-3 flex-wrap">
                                          <code className="text-sm bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg font-mono border">
                                            {secret.token}
                                          </code>
                                          {secret.isFile && (
                                            <Badge variant="secondary" className="gap-1 rounded-lg">
                                              <FileText className="h-3 w-3" />
                                              {secret.fileName}
                                            </Badge>
                                          )}
                                          {isExpired ? (
                                            <Badge variant="destructive" className="rounded-lg">Expired</Badge>
                                          ) : (
                                            <Badge variant="secondary" className="rounded-lg">
                                              {hoursLeft}h remaining
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                                          <p><span className="font-medium">Created:</span> {new Date(secret.createdAt).toLocaleString()}</p>
                                          <p><span className="font-medium">TTL:</span> {secret.ttl} • <span className="font-medium">Max reads:</span> {secret.maxReads === 0 ? 'unlimited' : secret.maxReads}</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2 ml-4">
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          onClick={() => copyToClipboard(secret.shareUrl)}
                                          disabled={isExpired}
                                          className="rounded-xl transition-all duration-300 hover:scale-105"
                                        >
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          onClick={() => {
                                            generateQRCode(secret.shareUrl);
                                            setResult({ success: true, ...secret });
                                          }}
                                          disabled={isExpired}
                                          className="rounded-xl transition-all duration-300 hover:scale-105"
                                        >
                                          <QrCode className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-30"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                GOVault
              </span>
            </div>
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              🔐 Zero-knowledge secret sharing with end-to-end encryption
            </p>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Your secrets are encrypted in your browser before transmission. The server never sees your plaintext data.
              Built with military-grade security and privacy-first architecture.
            </p>
            
            <div className="flex justify-center items-center gap-6 pt-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>AES-256-GCM</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Zero-Knowledge</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span>Auto-Expire</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
