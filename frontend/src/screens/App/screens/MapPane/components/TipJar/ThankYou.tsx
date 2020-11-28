import React from 'react';
import Modal from 'components/Modal';
import qs from 'qs';
import recordEvent from 'shared/utils/recordEvent';
import { useHistory } from 'react-router-dom';

export default function ThankYou({
  isOpen,
  onRequestClose,
}: Pick<ReactModal.Props, 'isOpen' | 'onRequestClose'>): JSX.Element {
  const history = useHistory();
  const { tipAmount } = qs.parse(window.location.search);

  React.useEffect(() => {
    if (!isOpen) return;
    recordEvent({
      action: 'Completes Tip',
      category: 'Tip Jar',
      value: Number(tipAmount),
      nonInteraction: true,
    });

    // Remove query from url
    history.replace({
      pathname: history.location.pathname,
      hash: history.location.hash,
    });
  }, [tipAmount, isOpen]);

  return (
    <Modal size="small" isOpen={isOpen} onRequestClose={onRequestClose}>
      <h1>Thank you</h1>
      <p>Thank you so much for you helping out!</p>
      <p>
        <em>– Julian</em>
      </p>
    </Modal>
  );
}
