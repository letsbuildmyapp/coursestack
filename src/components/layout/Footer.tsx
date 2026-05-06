import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-rule mt-24 pt-16 pb-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-5">
          <div className="col-span-2">
            <h3 className="font-display text-title1 leading-tight">CourseStack</h3>
            <p className="mt-3 max-w-md text-footnote text-ink-mute">
              A reading-room for working professionals. Six new courses every quarter, taught by people who still ship.
            </p>
          </div>
          <div>
            <p className="eyebrow">Library</p>
            <ul className="mt-3 space-y-2 text-footnote">
              <li><Link to="/catalog" className="hover:text-terra-deep">Catalog</Link></li>
              <li><Link to="/instructors" className="hover:text-terra-deep">Instructors</Link></li>
              <li><a href="#editorial" className="hover:text-terra-deep">The Quarterly</a></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">Company</p>
            <ul className="mt-3 space-y-2 text-footnote">
              <li><a href="#pricing" className="hover:text-terra-deep">Pricing</a></li>
              <li><a href="#about" className="hover:text-terra-deep">About</a></li>
              <li><a href="#changelog" className="hover:text-terra-deep">Changelog</a></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">Sign in</p>
            <ul className="mt-3 space-y-2 text-footnote">
              <li><Link to="/login" className="hover:text-terra-deep">Member</Link></li>
              <li><Link to="/login" className="hover:text-terra-deep">Instructor</Link></li>
              <li><Link to="/login" className="hover:text-terra-deep">Admin</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-rule pt-6 md:flex-row md:items-center">
          <p className="text-caption text-ink-mute num">
            © 2026 CourseStack — A letsbuildmyapp.com portfolio demo.
          </p>
          <p className="text-caption text-ink-mute">Set in Fraunces &amp; Inter. Light mode only, by design.</p>
        </div>
      </div>
    </footer>
  );
}
