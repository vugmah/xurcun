import { createRouter, publicQuery } from "./middleware";
import { menuRouter } from "./routers/menu";
import { catalogRouter } from "./routers/catalog";
import { translateRouter } from "./routers/translate";
import { settingsRouter } from "./routers/settings";
import { photosRouter } from "./routers/photos";
import { seoRouter } from "./routers/seo";
import { statsRouter } from "./routers/stats";
import { trackingRouter } from "./routers/tracking";
import { branchRouter } from "./routers/branch";
import { branchMenuRouter } from "./routers/branchMenu";
import { mediaRouter } from "./routers/media";
import { photoAssignmentsRouter } from "./routers/photoAssignments";
import { mailRouter } from "./routers/mail";
import { googleAdsRouter } from "./routers/googleAds";
import { metaCapiRouter } from "./routers/metaCapi";
import { popupRouter } from "./routers/popup";
import { analyticsRouter } from "./routers/analytics";
import { badgesRouter } from "./routers/badges";
import { ordersRouter } from "./routers/orders";
import { blogRouter } from "./routers/blog";
import { faqRouter } from "./routers/faq";
import { homepageTextRouter } from "./routers/homepageText";
import { pageTextRouter } from "./routers/pageText";
export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  menu: menuRouter,
  catalog: catalogRouter,
  translate: translateRouter,
  settings: settingsRouter,
  photos: photosRouter,
  seo: seoRouter,
  stats: statsRouter,
  tracking: trackingRouter,
  branch: branchRouter,
  branchMenu: branchMenuRouter,
  media: mediaRouter,
  photoAssignments: photoAssignmentsRouter,
  mail: mailRouter,
  googleAds: googleAdsRouter,
  metaCapi: metaCapiRouter,
  popup: popupRouter,
  analytics: analyticsRouter,
  badges: badgesRouter,
  orders: ordersRouter,
  blog: blogRouter,
  faq: faqRouter,
  homepageText: homepageTextRouter,
  pageText: pageTextRouter,
});

export type AppRouter = typeof appRouter;
