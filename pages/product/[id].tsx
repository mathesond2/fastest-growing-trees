import AddToCartButton from '@/components/AddToCartButton';
import DetailCard from '@/components/DetailCard';
import ImageWithFallback from '@/components/ImageWithFallback';
import { ParsedProduct, ParsedProducts } from '@/types/data';
import { Box, Center, Stack } from '@chakra-ui/react';
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from 'next';
import Head from 'next/head';
import { NextRequest } from 'next/server';
import { ParsedUrlQuery } from 'querystring';
import productHandler from '../api/product/[id]';
import productsHandler from '../api/products';
import { DEV_URL, PROD_URL } from '@/util/constants';

interface Params extends ParsedUrlQuery {
  id: string;
}

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const res = productsHandler();
  const data: ParsedProducts = await res.json();

  const paths = data.products.map(({ id }) => ({
    params: { id: id.toString() },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const { id } = context.params!;
  const url = process.env.NODE_ENV === 'development' ? DEV_URL : PROD_URL;
  const nextReq = new NextRequest(new URL(`${url}/api/product?id=${id}}`));
  const res = productHandler(nextReq);
  const data: ParsedProduct = await res.json();

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: { product: data },
  };
};

const imgHeight = '34.625rem';
const imgWidth = '34.75rem';
const imgFallbackHeight = '554';
const imgFallbackWidth = '556';
const detailCardContainerWidth = '20.625rem';

export default function ProductPage({ product }: InferGetStaticPropsType<typeof getStaticProps>) {
  const { alt, body, id, price, src, title } = product;
  const titleContent = `${title} | Fastest Growing Trees`;
  return (
    <>
      <Head>
        <title>{titleContent}</title>
        <meta name="description" content={body} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Center>
          <Stack spacing={4} direction={['column', 'column', 'row', 'row']}>
            <Box position={'relative'} h={imgHeight} w={['100%', null, '100%', imgWidth]} borderTopRadius="lg">
              <ImageWithFallback
                src={src}
                alt={alt || title}
                fill
                sizes={`(max-width: 768px) ${imgWidth},
                (max-width: 1200px) ${imgWidth},
                ${imgWidth}`}
                fallbackSrc={`https://via.placeholder.com/${imgFallbackWidth}x${imgFallbackHeight}.png?text=?`}
              />
            </Box>
            <Box w={['100%', null, '100%', detailCardContainerWidth]}>
              <DetailCard title={title} subtitle="About" body={body}>
                <AddToCartButton product={product} />
              </DetailCard>
            </Box>
          </Stack>
        </Center>
      </main>
    </>
  );
}
