      <main className={`${!hideNav && !isYouTube ? 'pt-20 md:pt-16' : ''} min-h-screen`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/series" element={<SeriesPage />} />
          <Route path="/livetv" element={<LiveTvPage />} />
          <Route path="/livetv/:networkId" element={<LiveTvNetworkDetailPage />} />
          <Route path="/livetv/:networkId/:streamId" element={<LiveTvPlayerPage />} />
          <Route path="/detail/:id" element={<DetailPage />} />
          <Route path="/player/:id" element={<PlayerPage />} />
          <Route path="/download/:id" element={<DownloadPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/upcoming" element={<UpcomingPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/request" element={<RequestContentPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/ad" element={<AdPage />} />
          <Route path="/advertiser-panel" element={<AdvertiserPanelPage />} />

          {/* YouTube Routes */}
          <Route path="/youtube" element={<YouTubeHomePage />} />
          <Route path="/youtube/watch/:videoId" element={<YouTubeWatchPage />} />
          <Route path="/youtube/shorts" element={<YouTubeShortsPage />} />
          <Route path="/youtube/shorts/:videoId" element={<YouTubeShortsPage />} />
          <Route path="/youtube/subscriptions" element={<YouTubeSubscriptionsPage />} />
          <Route path="/youtube/library" element={<YouTubeLibraryPage />} />
          <Route path="/youtube/search" element={<YouTubeSearchPage />} />

          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/dmca" element={<DmcaPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactUsPage />} />

          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="*" element={<div className="flex h-screen items-center justify-center">Page Not Found</div>} />
        </Routes>
      </main>

      {!hideNav && !isYouTube && location.pathname !== '/' && <BannerAd />}
      {!hideNav && !isYouTube && <Footer />}
      {!hideNav && !isYouTube && <BottomNav />}
      {!hideNav && !isYouTube && <WhatsAppFab />}
      {!hideNav && !isYouTube && <TelegramFab />}
      {isYouTube && <YouTubeFooter />}

      <InstallPwaFab />
      <ThemeModal />
      <AboutMeModal />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
};

export default App;

