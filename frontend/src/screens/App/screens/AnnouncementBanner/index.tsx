import React from 'react';

import stylesheet from './AnnouncementBanner.less';

const DISPLAY_UNTIL = new Date(2022, 4);
const HIDE_KEY = 'alternatesBanner';

export default function AnnouncementBanner(): JSX.Element | null {
  const [now, setNow] = React.useState(Date.now());
  const [hidden, setHidden] = React.useState(
    localStorage.getItem(HIDE_KEY) === 'true'
  );

  React.useEffect(() => {
    const handle = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(handle);
  }, []);

  const hide = (): void => {
    localStorage.setItem(HIDE_KEY, 'true');
    setHidden(true);
  };

  const diffS = (DISPLAY_UNTIL.getTime() - now) / 1000;

  if (diffS < 0 || hidden) return null;

  // const days = Math.floor(diffS / 86400);
  // let remS = diffS - days * 86400;
  // const hours = Math.floor(remS / 3600);
  // remS -= hours * 3600;
  // const mins = Math.floor(remS / 60);
  // remS -= mins * 60;
  // const sec = Math.floor(remS);

  return (
    <div className={stylesheet.container}>
      New: Hover or tap on an image for more photos of the same location, where
      available.{' '}
      <button className={stylesheet.hideButton} onClick={hide}>
        Hide
      </button>
    </div>
  );
}
