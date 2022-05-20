/* eslint-disable react/require-default-props */
/* eslint-disable react/no-children-prop */
import { useRouter } from 'next/router';
import { ReactNode, useState } from 'react';
import { HeaderLayout } from './layout';

type Props = {
  children: ReactNode;
};

export const Header = ({ children }: Props) => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const router = useRouter();

  function handleLinkToPage(path: string) {
    router.push(path);
  }

  function handleCloseSideMenu() {
    setIsSideMenuOpen(false);
  }

  function handleOpenSideMenu() {
    setIsSideMenuOpen(true);
  }

  return (
    <HeaderLayout
      handleLinkToPage={handleLinkToPage}
      isSideMenuOpen={isSideMenuOpen}
      handleCloseSideMenu={handleCloseSideMenu}
      children={children}
      handleOpenSideMenu={handleOpenSideMenu}
    />
  );
};
