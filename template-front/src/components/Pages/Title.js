import { useEffect } from 'react';
import { CONSTANT } from '../../utils/constant';

const Title = ({ title }) => {
  useEffect(() => {
    document.title = `${title} • ${CONSTANT.AUTH.APP_NAME}`;
  }, [title]); 

  return null; 
};

export default Title;
