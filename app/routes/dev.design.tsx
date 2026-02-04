export function meta() {
  return [{ title: "Design System - notscared" }];
}

export default function DevDesign() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      <header>
        <h1 className="text-2xl font-semibold mb-2">Design System</h1>
        <p className="text-gray-600">UI/UX baseline for notscared</p>
      </header>

      {/* Colors */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Colors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="h-16 bg-black border"></div>
            <p className="text-sm mt-1">Black (Primary)</p>
          </div>
          <div>
            <div className="h-16 bg-white border"></div>
            <p className="text-sm mt-1">White (Background)</p>
          </div>
          <div>
            <div className="h-16 bg-gray-500 border"></div>
            <p className="text-sm mt-1">Gray 500 (Muted)</p>
          </div>
          <div>
            <div className="h-16 bg-gray-600 border"></div>
            <p className="text-sm mt-1">Gray 600 (Secondary text)</p>
          </div>

          <div>
            <div className="h-16 bg-amber-600 border"></div>
            <p className="text-sm mt-1">Amber 600 (Accent)</p>
          </div>
          <div>
            <div className="h-16 bg-red-600 border"></div>
            <p className="text-sm mt-1">Red 600 (Danger)</p>
          </div>
          <div>
            <div className="h-16 bg-green-600 border"></div>
            <p className="text-sm mt-1">Green 600 (Success)</p>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Typography</h2>
        <div className="space-y-4">
          <div>
            <p className="text-2xl font-semibold">Heading 1 (text-2xl font-semibold)</p>
          </div>
          <div>
            <p className="text-lg font-semibold">Heading 2 (text-lg font-semibold)</p>
          </div>
          <div>
            <p className="text-base">Body text (text-base)</p>
          </div>
          <div>
            <p className="text-sm">Small text (text-sm)</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Secondary text (text-sm text-gray-600)</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Muted text (text-sm text-gray-500)</p>
          </div>
          <div>
            <label className="form-label">Form Label (form-label)</label>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <button className="btn btn-primary">Primary Button</button>
          <button className="btn btn-primary" disabled>
            Disabled
          </button>
          <button className="underline decoration-black/50 hover:decoration-black/25 text-sm">Action</button>
          <button className="text-red-600 underline decoration-red-600/50 hover:decoration-red-600/25 text-sm">Danger Action</button>
          <a href="#" className="underline decoration-black/50 hover:decoration-black/25 text-sm">
            Link
          </a>
        </div>
      </section>

      {/* Form Elements */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Form Elements</h2>
        <div className="max-w-sm space-y-4">
          <div className="form-group">
            <label htmlFor="demo-input" className="form-label">
              Input Label
            </label>
            <input
              type="text"
              id="demo-input"
              className="input"
              placeholder="Placeholder text"
            />
            <p className="form-help">Helper text goes here</p>
          </div>
          <div className="form-group">
            <label htmlFor="demo-email" className="form-label">
              Email
            </label>
            <input type="email" id="demo-email" className="input" defaultValue="user@example.com" />
          </div>
          <div className="form-group">
            <label htmlFor="demo-password" className="form-label">
              Password
            </label>
            <input type="password" id="demo-password" className="input" defaultValue="password" />
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Alerts</h2>
        <div className="space-y-4 max-w-md">
          <div className="alert alert-error">This is an error message</div>
          <div className="border border-green-600 bg-green-50 text-green-800 p-3 text-sm">
            This is a success message (proposed)
          </div>
          <div className="border border-amber-600 bg-amber-50 text-amber-800 p-3 text-sm">
            This is a warning message (proposed)
          </div>
        </div>
      </section>

      {/* Table */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Table</h2>
        <div className="border overflow-hidden">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Role</th>
                <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-3 text-sm">Alice Johnson</td>
                <td className="px-4 py-3 text-sm">
                  <span className="text-green-600 font-medium">Active</span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="text-amber-600 font-medium">Admin</span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <button className="underline decoration-black/50 hover:decoration-black/25 text-sm">Edit</button>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm">Bob Smith</td>
                <td className="px-4 py-3 text-sm">
                  <span className="text-green-600 font-medium">Active</span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="text-gray-500">User</span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <button className="underline decoration-black/50 hover:decoration-black/25 text-sm mr-3">Edit</button>
                  <button className="text-red-600 underline decoration-red-600/50 hover:decoration-red-600/25 text-sm">Delete</button>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm">Carol White</td>
                <td className="px-4 py-3 text-sm">
                  <span className="text-gray-400">Inactive</span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="text-gray-500">User</span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <button className="underline decoration-black/50 hover:decoration-black/25 text-sm mr-3">Edit</button>
                  <button className="text-red-600 underline decoration-red-600/50 hover:decoration-red-600/25 text-sm">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Tables: border, no border-radius, no header background, divide-y rows
        </p>
      </section>

      {/* Spacing & Layout */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Spacing Guidelines</h2>
        <ul className="text-sm space-y-2 text-gray-600">
          <li>
            <strong className="text-black">Page padding:</strong> p-8
          </li>
          <li>
            <strong className="text-black">Max content width:</strong> max-w-4xl mx-auto
          </li>
          <li>
            <strong className="text-black">Section spacing:</strong> Use flex + gap or space-y-* utilities
          </li>
          <li>
            <strong className="text-black">Table cell padding:</strong> px-4 py-3
          </li>
          <li>
            <strong className="text-black">Navbar padding:</strong> px-4 py-3
          </li>
        </ul>
      </section>

      {/* Design Principles */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Design Principles</h2>
        <ul className="text-sm space-y-2 text-gray-600">
          <li>
            <strong className="text-black">Sharp edges:</strong> No border-radius (rounded-none)
          </li>
          <li>
            <strong className="text-black">Bold borders:</strong> border for containers, border-b for subtle dividers
          </li>
          <li>
            <strong className="text-black">Minimal palette:</strong> Black, white, grays + accent colors sparingly
          </li>
          <li>
            <strong className="text-black">Clear hierarchy:</strong> Font weight and size for emphasis, not color
          </li>
          <li>
            <strong className="text-black">Functional UI:</strong> No decorative elements, everything serves a purpose
          </li>
          <li>
            <strong className="text-black">Spacing:</strong> Prefer flex + gap over margins for layout spacing
          </li>
          <li>
            <strong className="text-black">Buttons:</strong> Always use cursor-pointer on clickable elements
          </li>
        </ul>
      </section>
    </div>
  );
}
