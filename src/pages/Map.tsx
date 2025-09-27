import { InteractiveMap } from '@/components/InteractiveMap';

export default function Map() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Project Map</h1>
            <p className="text-muted-foreground mt-2">
              Interactive visualization of Blue Carbon projects across coastal regions
            </p>
          </div>
          
          <InteractiveMap height="700px" />
        </div>
      </div>
    </div>
  );
}