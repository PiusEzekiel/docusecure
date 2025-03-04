import { Helmet } from "react-helmet";

const SecurityHeaders = () => {
  return (
    <Helmet>
      <meta httpEquiv="Content-Security-Policy" content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        font-src 'self' data:;
        img-src 'self' data:;
        connect-src 'self' https://eth-mainnet.g.alchemy.com;
      "/>
    </Helmet>
  );
};

export default SecurityHeaders;
