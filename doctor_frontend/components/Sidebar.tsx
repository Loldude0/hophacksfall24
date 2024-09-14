import { Button } from "@/components/ui/button"

export default function Sidebar({ setSelectedView }) {
  return (
    <div className="w-64 bg-white shadow-md p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Navigation</h2>
      <div className="space-y-2">
        <Button 
          onClick={() => setSelectedView('patient-info')} 
          className="w-full justify-start"
        >
          Patient Information
        </Button>
        <Button 
          onClick={() => setSelectedView('disease-map')} 
          className="w-full justify-start"
        >
          Map of Disease
        </Button>
      </div>
    </div>
  )
}