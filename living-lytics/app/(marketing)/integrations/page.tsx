import { Button } from "@/components/ui/button"

export default function IntegrationsPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Connect with your favorite tools</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Living Lytics integrates seamlessly with the platforms you use every day.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
             {/* Placeholder grid for integrations */}
             {['Google Analytics', 'Facebook Ads', 'Shopify', 'HubSpot', 'Salesforce', 'Slack'].map((tool) => (
                <div key={tool} className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-xs font-bold text-gray-400">LOGO</div>
                  <h3 className="text-lg font-semibold text-gray-900">{tool}</h3>
                  <Button variant="link" className="mt-2 text-blue-600">Learn more &rarr;</Button>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}
