import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { api, DonghuaCard as DonghuaCardType } from '@/lib/api';
import { DonghuaCard } from '@/components/DonghuaCard';
import { LoadingGrid } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';

export default function ByYear() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [donghua, setDonghua] = useState<DonghuaCardType[]>([]);
  const [loading, setLoading] = useState(false);

  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());

  useEffect(() => {
    const fetchByYear = async () => {
      try {
        setLoading(true);
        const data = await api.getByYear(selectedYear);
        // API returns 'data' array, not 'season_donghua'
        setDonghua(data.data || data.season_donghua || []);
      } catch (error) {
        console.error('Error fetching by year:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchByYear();
  }, [selectedYear]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10">
            <Calendar className="w-6 h-6 text-purple-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Donghua by Year</h1>
        </div>

        {/* Year selector */}
        <div className="flex flex-wrap gap-3 mb-8">
          {years.map(year => (
            <Button
              key={year}
              onClick={() => setSelectedYear(year)}
              variant={selectedYear === year ? 'default' : 'outline'}
              className="rounded-full"
            >
              {year}
            </Button>
          ))}
        </div>

        {loading ? (
          <LoadingGrid count={24} />
        ) : donghua.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">No donghua found for {selectedYear}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {donghua.map((item, index) => (
              <DonghuaCard key={index} donghua={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
