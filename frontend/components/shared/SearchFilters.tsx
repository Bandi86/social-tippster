// Magyar: Újrafelhasználható keresési és szűrő komponensek
// Reusable search and filter components

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Filter, Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
}

/**
 * Magyar: Keresősáv komponens debounce-szal
 */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Keresés...',
  className,
  onClear,
}: SearchBarProps) {
  return (
    <div className={cn('relative flex-1 max-w-md', className)}>
      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className='pl-10 pr-10 bg-gray-800 border-gray-600 text-white rounded-lg focus:ring-amber-500 focus:border-amber-500 transition'
      />
      {value && onClear && (
        <Button
          variant='ghost'
          size='sm'
          onClick={onClear}
          className='absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-700'
        >
          <X className='h-3 w-3' />
        </Button>
      )}
    </div>
  );
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface TypeFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
}

/**
 * Magyar: Típus szűrő komponens
 */
export function TypeFilter({ value, onChange, options, className }: TypeFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn('w-[180px] bg-gray-800 border-gray-600 text-white rounded-lg', className)}
      >
        <Filter className='h-4 w-4 mr-2' />
        <SelectValue placeholder='Típus' />
      </SelectTrigger>
      <SelectContent className='bg-gray-800 border-gray-600'>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
            {option.count !== undefined && ` (${option.count})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface SortFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

/**
 * Magyar: Rendezési szűrő komponens
 */
export function SortFilter({ value, onChange, options, className }: SortFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn('w-[140px] bg-gray-800 border-gray-600 text-white rounded-lg', className)}
      >
        <SelectValue placeholder='Rendezés' />
      </SelectTrigger>
      <SelectContent className='bg-gray-800 border-gray-600'>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchClear?: () => void;
  searchPlaceholder?: string;

  typeFilter?: string;
  onTypeChange?: (value: string) => void;
  typeOptions?: FilterOption[];

  sortFilter?: string;
  onSortChange?: (value: string) => void;
  sortOptions?: { value: string; label: string }[];

  actionButton?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

/**
 * Magyar: Kombinált keresési és szűrő komponens
 */
export function SearchFilters({
  searchQuery,
  onSearchChange,
  onSearchClear,
  searchPlaceholder,
  typeFilter,
  onTypeChange,
  typeOptions,
  sortFilter,
  onSortChange,
  sortOptions,
  actionButton,
  className,
  compact = false,
}: SearchFiltersProps) {
  return (
    <Card
      className={cn(
        'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-lg',
        className,
      )}
    >
      <CardContent className={cn('p-4', compact && 'p-3')}>
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div className='flex flex-col sm:flex-row gap-4 flex-1'>
            {/* Magyar: Kereső mező */}
            <SearchBar
              value={searchQuery}
              onChange={onSearchChange}
              onClear={onSearchClear}
              placeholder={searchPlaceholder}
            />

            {/* Magyar: Szűrők */}
            <div className='flex gap-2'>
              {typeOptions && onTypeChange && typeFilter && (
                <TypeFilter value={typeFilter} onChange={onTypeChange} options={typeOptions} />
              )}

              {sortOptions && onSortChange && sortFilter && (
                <SortFilter value={sortFilter} onChange={onSortChange} options={sortOptions} />
              )}
            </div>
          </div>

          {/* Magyar: Akció gomb */}
          {actionButton}
        </div>
      </CardContent>
    </Card>
  );
}

interface ActiveFiltersProps {
  filters: {
    key: string;
    label: string;
    value: string;
    onRemove: () => void;
  }[];
  onClearAll?: () => void;
  className?: string;
}

/**
 * Magyar: Aktív szűrők megjelenítése
 */
export function ActiveFilters({ filters, onClearAll, className }: ActiveFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className='text-sm text-gray-400'>Aktív szűrők:</span>
      {filters.map(filter => (
        <Badge
          key={filter.key}
          variant='outline'
          className='border-amber-600 text-amber-400 flex items-center gap-1'
        >
          <span>
            {filter.label}: {filter.value}
          </span>
          <Button
            variant='ghost'
            size='sm'
            onClick={filter.onRemove}
            className='h-4 w-4 p-0 hover:bg-amber-900/50'
          >
            <X className='h-3 w-3' />
          </Button>
        </Badge>
      ))}
      {onClearAll && filters.length > 1 && (
        <Button
          variant='ghost'
          size='sm'
          onClick={onClearAll}
          className='text-xs text-gray-400 hover:text-white'
        >
          Összes törlése
        </Button>
      )}
    </div>
  );
}
