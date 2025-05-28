import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Users,
  XCircle,
} from 'lucide-react';

interface SystemStat {
  label: string;
  value: string | number;
  status: 'online' | 'warning' | 'offline' | 'pending';
  icon: React.ComponentType<{ className?: string }>;
}

const AdminSystemStatus = () => {
  const systemStats: SystemStat[] = [
    {
      label: 'System Status',
      value: 'Online',
      status: 'online',
      icon: Activity,
    },
    {
      label: 'Active Users',
      value: '1,234',
      status: 'online',
      icon: Users,
    },
    {
      label: 'Total Posts',
      value: '5,678',
      status: 'online',
      icon: FileText,
    },
    {
      label: 'Pending Reviews',
      value: '12',
      status: 'warning',
      icon: MessageSquare,
    },
  ];

  const getStatusIcon = (status: SystemStat['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className='h-3 w-3 text-green-400' />;
      case 'warning':
        return <AlertTriangle className='h-3 w-3 text-yellow-400' />;
      case 'offline':
        return <XCircle className='h-3 w-3 text-red-400' />;
      case 'pending':
        return <Clock className='h-3 w-3 text-blue-400' />;
      default:
        return <CheckCircle className='h-3 w-3 text-gray-400' />;
    }
  };

  const getStatusColor = (status: SystemStat['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'offline':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'pending':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className='hidden xl:flex items-center space-x-4'>
      {systemStats.map((stat, index) => (
        <div
          key={stat.label}
          className='flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-900/50 border border-amber-500/20'
        >
          <stat.icon className='h-4 w-4 text-amber-400' />
          <div className='flex flex-col'>
            <span className='text-xs text-amber-400/80'>{stat.label}</span>
            <div className='flex items-center space-x-1'>
              <span className='text-sm font-medium text-amber-100'>{stat.value}</span>
              {getStatusIcon(stat.status)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminSystemStatus;
