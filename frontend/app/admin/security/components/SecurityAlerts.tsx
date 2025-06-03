// filepath: frontend/app/admin/security/components/SecurityAlerts.tsx
// ===============================
// Security Alerts Component
// Displays security events, threats, and alerts
// ===============================

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import {
  AlertTriangle,
  Clock,
  ExternalLink,
  Eye,
  RefreshCw,
  Search,
  Shield,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Security Alert Types
export interface SecurityAlert {
  id: string;
  type: 'login_failure' | 'suspicious_activity' | 'rate_limit' | 'security_breach' | 'system_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  timestamp: Date;
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
  metadata?: {
    ip?: string;
    userAgent?: string;
    userId?: string;
    location?: string;
    attempts?: number;
    details?: Record<string, any>;
  };
}

interface SecurityAlertsProps {
  className?: string;
  limit?: number;
  compact?: boolean;
}

// Mock data - In real implementation, this would come from API
const mockAlerts: SecurityAlert[] = [
  {
    id: '1',
    type: 'login_failure',
    severity: 'high',
    title: 'Multiple Failed Login Attempts',
    description: 'Detected 15 failed login attempts from IP 192.168.1.100 in the last 10 minutes',
    source: 'Authentication System',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: 'active',
    metadata: {
      ip: '192.168.1.100',
      attempts: 15,
      location: 'United States',
    },
  },
  {
    id: '2',
    type: 'suspicious_activity',
    severity: 'medium',
    title: 'Unusual Login Location',
    description: 'User logged in from a new location: Tokyo, Japan',
    source: 'Geo-Location Monitor',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: 'investigating',
    metadata: {
      userId: 'user-123',
      location: 'Tokyo, Japan',
      ip: '103.4.145.67',
    },
  },
  {
    id: '3',
    type: 'rate_limit',
    severity: 'medium',
    title: 'API Rate Limit Exceeded',
    description: 'Client exceeded API rate limits by 200% in the last hour',
    source: 'API Gateway',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: 'resolved',
    metadata: {
      ip: '45.123.67.89',
      details: { endpoint: '/api/auth/login', requests: 300 },
    },
  },
  {
    id: '4',
    type: 'system_alert',
    severity: 'critical',
    title: 'Database Connection Anomaly',
    description: 'Unusual database connection patterns detected',
    source: 'Database Monitor',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'investigating',
  },
];

export const SecurityAlerts: React.FC<SecurityAlertsProps> = ({
  className,
  limit,
  compact = false,
}) => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>(mockAlerts);
  const [filteredAlerts, setFilteredAlerts] = useState<SecurityAlert[]>(mockAlerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Filter alerts based on search and filters
  useEffect(() => {
    let filtered = alerts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        alert =>
          alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alert.source.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(alert => alert.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(alert => alert.type === typeFilter);
    }

    // Apply limit if specified
    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    setFilteredAlerts(filtered);
  }, [alerts, searchTerm, severityFilter, statusFilter, typeFilter, limit]);

  const getSeverityColor = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: SecurityAlert['status']) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'login_failure':
        return <Shield className='h-4 w-4' />;
      case 'suspicious_activity':
        return <Eye className='h-4 w-4' />;
      case 'rate_limit':
        return <Clock className='h-4 w-4' />;
      case 'security_breach':
        return <AlertTriangle className='h-4 w-4' />;
      case 'system_alert':
        return <AlertTriangle className='h-4 w-4' />;
      default:
        return <AlertTriangle className='h-4 w-4' />;
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts(
      alerts.map(alert =>
        alert.id === alertId ? { ...alert, status: 'dismissed' as const } : alert,
      ),
    );
  };

  const handleUpdateStatus = (alertId: string, status: SecurityAlert['status']) => {
    setAlerts(alerts.map(alert => (alert.id === alertId ? { ...alert, status } : alert)));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSeverityFilter('all');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  // Compact mode for overview
  if (compact) {
    return (
      <div className={className}>
        <div className='space-y-2'>
          {filteredAlerts.length === 0 ? (
            <div className='text-center py-4 text-gray-500'>
              <p className='text-sm'>No recent alerts</p>
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className='flex items-center justify-between p-2 rounded-lg border'
              >
                <div className='flex items-center gap-2'>
                  <div
                    className={`p-1 rounded ${alert.severity === 'critical' ? 'text-red-600' : alert.severity === 'high' ? 'text-orange-600' : 'text-yellow-600'}`}
                  >
                    {getTypeIcon(alert.type)}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium truncate'>{alert.title}</p>
                    <p className='text-xs text-gray-500'>
                      {format(alert.timestamp, 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                </div>
              </div>
            ))
          )}
          {limit && alerts.length > limit && (
            <div className='text-center pt-2'>
              <p className='text-xs text-gray-500'>
                Showing {limit} of {alerts.length} alerts
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5' />
              Security Alerts
            </CardTitle>
            <Button onClick={handleRefresh} disabled={isLoading} variant='outline' size='sm'>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='alerts' className='w-full'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='alerts'>All Alerts</TabsTrigger>
              <TabsTrigger value='active'>
                Active ({alerts.filter(a => a.status === 'active').length})
              </TabsTrigger>
              <TabsTrigger value='critical'>
                Critical ({alerts.filter(a => a.severity === 'critical').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value='alerts' className='space-y-4'>
              {/* Filters */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                  <Input
                    placeholder='Search alerts...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>

                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='Severity' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Severities</SelectItem>
                    <SelectItem value='critical'>Critical</SelectItem>
                    <SelectItem value='high'>High</SelectItem>
                    <SelectItem value='medium'>Medium</SelectItem>
                    <SelectItem value='low'>Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Statuses</SelectItem>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='investigating'>Investigating</SelectItem>
                    <SelectItem value='resolved'>Resolved</SelectItem>
                    <SelectItem value='dismissed'>Dismissed</SelectItem>
                  </SelectContent>
                </Select>

                <div className='flex gap-2'>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder='Type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Types</SelectItem>
                      <SelectItem value='login_failure'>Login Failures</SelectItem>
                      <SelectItem value='suspicious_activity'>Suspicious Activity</SelectItem>
                      <SelectItem value='rate_limit'>Rate Limits</SelectItem>
                      <SelectItem value='security_breach'>Security Breach</SelectItem>
                      <SelectItem value='system_alert'>System Alert</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={clearFilters} variant='outline' size='sm' className='px-2'>
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              {/* Alerts List */}
              <div className='space-y-3'>
                {filteredAlerts.length === 0 ? (
                  <div className='text-center py-8 text-gray-500'>
                    <AlertTriangle className='h-12 w-12 mx-auto mb-4 opacity-50' />
                    <p>No alerts found matching your criteria</p>
                  </div>
                ) : (
                  filteredAlerts.map(alert => (
                    <Card key={alert.id} className='border-l-4 border-l-gray-300'>
                      <CardContent className='p-4'>
                        <div className='flex items-start justify-between'>
                          <div className='flex items-start gap-3 flex-1'>
                            <div className='mt-1'>{getTypeIcon(alert.type)}</div>

                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-2 mb-2'>
                                <h4 className='font-semibold truncate'>{alert.title}</h4>
                                <Badge className={getSeverityColor(alert.severity)}>
                                  {alert.severity.toUpperCase()}
                                </Badge>
                                <Badge className={getStatusColor(alert.status)}>
                                  {alert.status.toUpperCase()}
                                </Badge>
                              </div>

                              <p className='text-sm text-gray-600 mb-2'>{alert.description}</p>

                              <div className='flex items-center gap-4 text-xs text-gray-500'>
                                <span>Source: {alert.source}</span>
                                <span>•</span>
                                <span>{format(alert.timestamp, 'MMM dd, yyyy HH:mm')}</span>
                                {alert.metadata?.ip && (
                                  <>
                                    <span>•</span>
                                    <span>IP: {alert.metadata.ip}</span>
                                  </>
                                )}
                              </div>

                              {alert.metadata && (
                                <div className='mt-2 pt-2 border-t border-gray-100'>
                                  <div className='flex flex-wrap gap-2 text-xs'>
                                    {alert.metadata.location && (
                                      <Badge variant='outline'>📍 {alert.metadata.location}</Badge>
                                    )}
                                    {alert.metadata.attempts && (
                                      <Badge variant='outline'>
                                        🔁 {alert.metadata.attempts} attempts
                                      </Badge>
                                    )}
                                    {alert.metadata.userId && (
                                      <Badge variant='outline'>👤 {alert.metadata.userId}</Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className='flex items-center gap-1 ml-4'>
                            {alert.status === 'active' && (
                              <Button
                                onClick={() => handleUpdateStatus(alert.id, 'investigating')}
                                size='sm'
                                variant='outline'
                              >
                                Investigate
                              </Button>
                            )}

                            {alert.status !== 'dismissed' && (
                              <Button
                                onClick={() => handleDismissAlert(alert.id)}
                                size='sm'
                                variant='ghost'
                              >
                                <X className='h-4 w-4' />
                              </Button>
                            )}

                            <Button size='sm' variant='ghost' className='p-1'>
                              <ExternalLink className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value='active' className='space-y-4'>
              <div className='space-y-3'>
                {alerts
                  .filter(alert => alert.status === 'active')
                  .map(alert => (
                    <Card key={alert.id} className='border-l-4 border-l-red-500'>
                      <CardContent className='p-4'>
                        <div className='flex items-start justify-between'>
                          <div className='flex items-start gap-3 flex-1'>
                            <div className='mt-1 text-red-500'>{getTypeIcon(alert.type)}</div>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-2'>
                                <h4 className='font-semibold'>{alert.title}</h4>
                                <Badge className={getSeverityColor(alert.severity)}>
                                  {alert.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <p className='text-sm text-gray-600'>{alert.description}</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleUpdateStatus(alert.id, 'investigating')}
                            size='sm'
                          >
                            Investigate
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value='critical' className='space-y-4'>
              <div className='space-y-3'>
                {alerts
                  .filter(alert => alert.severity === 'critical')
                  .map(alert => (
                    <Card key={alert.id} className='border-l-4 border-l-red-600 bg-red-50'>
                      <CardContent className='p-4'>
                        <div className='flex items-start justify-between'>
                          <div className='flex items-start gap-3 flex-1'>
                            <div className='mt-1 text-red-600'>
                              <AlertTriangle className='h-5 w-5' />
                            </div>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-2'>
                                <h4 className='font-semibold text-red-900'>{alert.title}</h4>
                                <Badge className='bg-red-200 text-red-800'>CRITICAL</Badge>
                              </div>
                              <p className='text-sm text-red-700'>{alert.description}</p>
                              <div className='text-xs text-red-600 mt-1'>
                                {format(alert.timestamp, 'MMM dd, yyyy HH:mm')}
                              </div>
                            </div>
                          </div>
                          <div className='flex gap-2'>
                            <Button
                              onClick={() => handleUpdateStatus(alert.id, 'investigating')}
                              size='sm'
                              className='bg-red-600 hover:bg-red-700'
                            >
                              Urgent Response
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Export is already handled by the 'export const SecurityAlerts' declaration above
