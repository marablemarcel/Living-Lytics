export default function CaseStudiesPage() {
  return (
    <div className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">Success Stories</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
              <div className="flex-shrink-0">
                <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-500">Case Study Image</div>
              </div>
              <div className="flex flex-1 flex-col justify-between bg-white p-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-600">
                    <a href="#" className="hover:underline">E-commerce</a>
                  </p>
                  <a href="#" className="mt-2 block">
                    <p className="text-xl font-semibold text-gray-900">How Company X Increased Revenue by 200%</p>
                    <p className="mt-3 text-base text-gray-500">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto accusantium praesentium eius, ut atque fuga culpa, similique sequi cum eos quis dolorum.
                    </p>
                  </a>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <span className="sr-only">Author</span>
                    <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      <a href="#" className="hover:underline">Jane Doe</a>
                    </p>
                    <div className="flex space-x-1 text-sm text-gray-500">
                      <time dateTime="2020-03-16">Mar 16, 2020</time>
                      <span aria-hidden="true">&middot;</span>
                      <span>6 min read</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
