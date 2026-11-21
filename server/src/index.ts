import { FakeStoreCatalogue } from "./adapters/fake-store-catalogue.js";
import { MemoryEmailSender } from "./adapters/memory-email-sender.js";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { CatalogueService } from "./services/catalogue-service.js";
import { EnquiryService } from "./services/enquiry-service.js";

const config = loadConfig();
const inbox = new MemoryEmailSender();
const catalogue = new CatalogueService(
  new FakeStoreCatalogue(config.fakeStoreBaseUrl, config.cacheSeconds * 1000),
  config.featuredProductIds,
  config.topRatedPerCategory,
);

const app = createApp({
  config,
  catalogue,
  enquiries: new EnquiryService(catalogue, inbox, config.salesInbox),
  inbox,
});

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
