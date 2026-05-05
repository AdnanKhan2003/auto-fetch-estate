'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { SunIcon, MoonIcon } from 'lucide-react';

function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [ mounted, setMounted ] = useState(false);

    useEffect(() => setMounted(true), []);

    if(!mounted) return null;

    const currentTheme = theme === 'system' ? resolvedTheme : theme;
    const isDark = currentTheme === 'dark';

  return (
    <Button type='button' variant='outline' onClick={() => setTheme(isDark ? 'light' : 'dark')} className='cursor-pointer size-8'>{isDark ? <SunIcon /> : <MoonIcon />}</Button>
  )
}

export default ThemeToggle