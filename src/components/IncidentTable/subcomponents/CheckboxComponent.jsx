/* eslint-disable react/jsx-props-no-spreading */
import {
  useEffect, forwardRef, useRef,
} from 'react';

const CheckboxComponent = forwardRef(({
  indeterminate, ...rest
}, ref) => {
  const defaultRef = useRef();
  const resolvedRef = ref || defaultRef;

  useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return (
    <>
      <input type="checkbox" ref={resolvedRef} {...rest} />
    </>
  );
});

export default CheckboxComponent;
