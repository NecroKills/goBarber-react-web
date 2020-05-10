import React from 'react';

import { Container } from './styles';

interface TooltipProps {
  title: string;
  // Para receber uma estilização de um elemento superior
  // tem que permitir que ele receba o className
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  title,
  children = '',
  className,
}) => {
  return (
    <Container className={className}>
      {children}
      <span>{title}</span>
    </Container>
  );
};

export default Tooltip;
