import { NrsTrackingPage } from './app.po';

describe('nrs-tracking App', function() {
  let page: NrsTrackingPage;

  beforeEach(() => {
    page = new NrsTrackingPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
