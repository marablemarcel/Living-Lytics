export default function ResourcesPage() {
  return (
    <div className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Resources</h1>
        <p className="text-xl text-center text-gray-600 mb-16">Guides, tutorials, and articles to help you master data analytics.</p>
        
        <div className="space-y-16">
           <section>
             <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
             <div className="grid gap-8 md:grid-cols-3">
               {[1, 2, 3].map(i => (
                 <div key={i} className="border p-6 rounded-xl hover:shadow-md transition-shadow">
                   <div className="h-40 bg-gray-100 mb-4 rounded-lg"></div>
                   <h3 className="font-bold text-lg mb-2">Article Title {i}</h3>
                   <p className="text-gray-600 text-sm">Brief summary of the article contents goes here...</p>
                 </div>
               ))}
             </div>
           </section>
        </div>
      </div>
    </div>
  )
}
