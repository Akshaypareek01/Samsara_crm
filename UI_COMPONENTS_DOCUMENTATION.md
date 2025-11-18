# UI Components Documentation

This document provides a comprehensive reference of all UI components available in this template, their locations, routes, and usage information.

---

## Table of Contents

1. [Layout Components](#layout-components)
2. [UI Elements](#ui-elements)
3. [Advanced UI Components](#advanced-ui-components)
4. [Form Components](#form-components)
5. [Chart Components](#chart-components)
6. [Table Components](#table-components)
7. [Page Components](#page-components)
8. [App Components](#app-components)
9. [Dashboard Components](#dashboard-components)
10. [Utility Components](#utility-components)
11. [Widget Components](#widget-components)
12. [Authentication Components](#authentication-components)
13. [Error Pages](#error-pages)

---

## Layout Components

These are reusable layout components used across the application.

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Header | `shared/layout-components/header/header.tsx` | N/A | Main application header with navigation, search, notifications, and user menu |
| Sidebar | `shared/layout-components/sidebar/sidebar.tsx` | N/A | Main sidebar navigation menu |
| Footer | `shared/layout-components/footer/footer.tsx` | N/A | Application footer |
| Page Header | `shared/layout-components/page-header/pageheader.tsx` | N/A | Reusable page header component with breadcrumbs |
| Back to Top | `shared/layout-components/backtotop/backtotop.tsx` | N/A | Scroll to top button component |
| Modal Search | `shared/layout-components/modal-search/modalsearch.tsx` | N/A | Search modal component |
| SEO | `shared/layout-components/seo/seo.tsx` | N/A | SEO metadata component |
| Show Code | `shared/layout-components/showcode/showcode.tsx` | N/A | Component to display code examples |
| Switcher | `shared/layout-components/switcher/switcher.tsx` | N/A | Theme and layout switcher |
| Landing Switcher | `shared/layout-components/switcher/landingswitcher.tsx` | N/A | Landing page specific switcher |
| Menu Loop | `shared/layout-components/sidebar/menuloop.tsx` | N/A | Menu item rendering component |
| Nav | `shared/layout-components/sidebar/nav.tsx` | N/A | Navigation menu configuration |

---

## UI Elements

Basic UI components and elements.

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Alerts | `app/(components)/(contentlayout)/ui-elements/alerts/page.tsx` | `/ui-elements/alerts` | Alert notification components with various styles |
| Badge | `app/(components)/(contentlayout)/ui-elements/badge/page.tsx` | `/ui-elements/badge` | Badge and label components |
| Blockquotes | `app/(components)/(contentlayout)/ui-elements/blockquotes/page.tsx` | `/ui-elements/blockquotes` | Blockquote styling components |
| Breadcrumb | `app/(components)/(contentlayout)/ui-elements/breadcrumb/page.tsx` | `/ui-elements/breadcrumb` | Breadcrumb navigation component |
| Button Group | `app/(components)/(contentlayout)/ui-elements/button-group/page.tsx` | `/ui-elements/button-group` | Button group components |
| Buttons | `app/(components)/(contentlayout)/ui-elements/buttons/page.tsx` | `/ui-elements/buttons` | Various button styles and variants |
| Cards | `app/(components)/(contentlayout)/ui-elements/cards/page.tsx` | `/ui-elements/cards` | Card components with multiple layouts |
| Dropdowns | `app/(components)/(contentlayout)/ui-elements/dropdowns/page.tsx` | `/ui-elements/dropdowns` | Dropdown menu components |
| Images & Figures | `app/(components)/(contentlayout)/ui-elements/images&figures/page.tsx` | `/ui-elements/images&figures` | Image and figure display components |
| Indicator | `app/(components)/(contentlayout)/ui-elements/indicator/page.tsx` | `/ui-elements/indicator` | Indicator components |
| Indicators | `app/(components)/(contentlayout)/ui-elements/indicators/page.tsx` | `/ui-elements/indicators` | Multiple indicator variants |
| List Group | `app/(components)/(contentlayout)/ui-elements/list-group/page.tsx` | `/ui-elements/list-group` | List group components |
| Navs & Tabs | `app/(components)/(contentlayout)/ui-elements/navs&tabs/page.tsx` | `/ui-elements/navs&tabs` | Navigation and tab components |
| Object Fit | `app/(components)/(contentlayout)/ui-elements/object-fit/page.tsx` | `/ui-elements/object-fit` | Object-fit image components |
| Pagination | `app/(components)/(contentlayout)/ui-elements/pagination/page.tsx` | `/ui-elements/pagination` | Pagination components |
| Popovers | `app/(components)/(contentlayout)/ui-elements/popovers/page.tsx` | `/ui-elements/popovers` | Popover tooltip components |
| Progress | `app/(components)/(contentlayout)/ui-elements/progress/page.tsx` | `/ui-elements/progress` | Progress bar components |
| Spinners | `app/(components)/(contentlayout)/ui-elements/spinners/page.tsx` | `/ui-elements/spinners` | Loading spinner components |
| Toasts | `app/(components)/(contentlayout)/ui-elements/toasts/page.tsx` | `/ui-elements/toasts` | Toast notification components |
| Tooltips | `app/(components)/(contentlayout)/ui-elements/tooltips/page.tsx` | `/ui-elements/tooltips` | Tooltip components |

---

## Advanced UI Components

Advanced interactive UI components.

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Accordions & Collapse | `app/(components)/(contentlayout)/advanced-ui/accordions&collapse/page.tsx` | `/advanced-ui/accordions&collapse` | Accordion and collapsible components |
| Custom Scrollbar | `app/(components)/(contentlayout)/advanced-ui/customscrollbar/page.tsx` | `/advanced-ui/customscrollbar` | Custom styled scrollbar components |
| Draggable Cards | `app/(components)/(contentlayout)/advanced-ui/draggable-cards/page.tsx` | `/advanced-ui/draggable-cards` | Drag and drop card components |
| Modals & Closes | `app/(components)/(contentlayout)/advanced-ui/modals&closes/page.tsx` | `/advanced-ui/modals&closes` | Modal dialog components |
| Navbar | `app/(components)/(contentlayout)/advanced-ui/navbar/page.tsx` | `/advanced-ui/navbar` | Advanced navbar components |
| Offcanvas | `app/(components)/(contentlayout)/advanced-ui/offcanvas/page.tsx` | `/advanced-ui/offcanvas` | Offcanvas sidebar components |
| Ratings | `app/(components)/(contentlayout)/advanced-ui/ratings/page.tsx` | `/advanced-ui/ratings` | Rating and star components |
| Scrollspy | `app/(components)/(contentlayout)/advanced-ui/scrollspy/page.tsx` | `/advanced-ui/scrollspy` | Scroll spy navigation components |
| Stepper | `app/(components)/(contentlayout)/advanced-ui/stepper/page.tsx` | `/advanced-ui/stepper` | Step-by-step wizard components |
| Swiper JS | `app/(components)/(contentlayout)/advanced-ui/swiper-js/page.tsx` | `/advanced-ui/swiper-js` | Carousel and slider components |

---

## Form Components

Form elements and input components.

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Form Layouts | `app/(components)/(contentlayout)/forms/form-layouts/page.tsx` | `/forms/form-layouts` | Various form layout templates |
| Form Editors | `app/(components)/(contentlayout)/forms/formeditors/page.tsx` | `/forms/formeditors` | Rich text editor components |
| Advanced Select | `app/(components)/(contentlayout)/forms/formelements/advancedselect/page.tsx` | `/forms/formelements/advancedselect` | Advanced select dropdown components |
| Checks & Radios | `app/(components)/(contentlayout)/forms/formelements/checks&radios/page.tsx` | `/forms/formelements/checks&radios` | Checkbox and radio button components |
| Color Picker | `app/(components)/(contentlayout)/forms/formelements/color-picker/page.tsx` | `/forms/formelements/color-picker` | Color picker input components |
| Counter Markup | `app/(components)/(contentlayout)/forms/formelements/countermarkup/page.tsx` | `/forms/formelements/countermarkup` | Counter/number input components |
| Date Time Picker | `app/(components)/(contentlayout)/forms/formelements/date-time-picker/page.tsx` | `/forms/formelements/date-time-picker` | Date and time picker components |
| File Uploads | `app/(components)/(contentlayout)/forms/formelements/file-uploads/page.tsx` | `/forms/formelements/file-uploads` | File upload input components |
| Form Select | `app/(components)/(contentlayout)/forms/formelements/form-select/page.tsx` | `/forms/formelements/form-select` | Select dropdown components |
| Form Switch | `app/(components)/(contentlayout)/forms/formelements/formswitch/page.tsx` | `/forms/formelements/formswitch` | Toggle switch components |
| Input Group | `app/(components)/(contentlayout)/forms/formelements/input-group/page.tsx` | `/forms/formelements/input-group` | Input group with addons |
| Input Number | `app/(components)/(contentlayout)/forms/formelements/inputnumber/page.tsx` | `/forms/formelements/inputnumber` | Number input components |
| Inputs | `app/(components)/(contentlayout)/forms/formelements/inputs/page.tsx` | `/forms/formelements/inputs` | Basic input field components |
| Passwords | `app/(components)/(contentlayout)/forms/formelements/passwords/page.tsx` | `/forms/formelements/passwords` | Password input components |
| Range Slider | `app/(components)/(contentlayout)/forms/formelements/range-slider/page.tsx` | `/forms/formelements/range-slider` | Range slider components |
| Select2 | `app/(components)/(contentlayout)/forms/select2/page.tsx` | `/forms/select2` | Select2 enhanced dropdown components |
| Validation | `app/(components)/(contentlayout)/forms/validation/page.tsx` | `/forms/validation` | Form validation examples |

---

## Chart Components

Data visualization and chart components.

### ApexCharts

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Area Charts | `app/(components)/(contentlayout)/charts/apexcharts/area-charts/page.tsx` | `/charts/apexcharts/area-charts` | Area chart components |
| Bar Charts | `app/(components)/(contentlayout)/charts/apexcharts/bar-charts/page.tsx` | `/charts/apexcharts/bar-charts` | Bar chart components |
| Boxplot Chart | `app/(components)/(contentlayout)/charts/apexcharts/boxplot-chart/page.tsx` | `/charts/apexcharts/boxplot-chart` | Boxplot chart component |
| Bubble Chart | `app/(components)/(contentlayout)/charts/apexcharts/bubble-chart/page.tsx` | `/charts/apexcharts/bubble-chart` | Bubble chart component |
| Candlestick Chart | `app/(components)/(contentlayout)/charts/apexcharts/candlestick-chart/page.tsx` | `/charts/apexcharts/candlestick-chart` | Candlestick chart component |
| Column Charts | `app/(components)/(contentlayout)/charts/apexcharts/column-charts/page.tsx` | `/charts/apexcharts/column-charts` | Column chart components |
| Heatmap Chart | `app/(components)/(contentlayout)/charts/apexcharts/heatmap-chart/page.tsx` | `/charts/apexcharts/heatmap-chart` | Heatmap chart component |
| Line Charts | `app/(components)/(contentlayout)/charts/apexcharts/line-charts/page.tsx` | `/charts/apexcharts/line-charts` | Line chart components |
| Mixed Charts | `app/(components)/(contentlayout)/charts/apexcharts/mixed-charts/page.tsx` | `/charts/apexcharts/mixed-charts` | Mixed chart types |
| Pie Chart | `app/(components)/(contentlayout)/charts/apexcharts/pie-chart/page.tsx` | `/charts/apexcharts/pie-chart` | Pie chart component |
| Polar Area Chart | `app/(components)/(contentlayout)/charts/apexcharts/polararea-chart/page.tsx` | `/charts/apexcharts/polararea-chart` | Polar area chart component |
| Radar Chart | `app/(components)/(contentlayout)/charts/apexcharts/radar-chart/page.tsx` | `/charts/apexcharts/radar-chart` | Radar chart component |
| Radial Bar Chart | `app/(components)/(contentlayout)/charts/apexcharts/radialbar-chart/page.tsx` | `/charts/apexcharts/radialbar-chart` | Radial bar chart component |
| Range Area Chart | `app/(components)/(contentlayout)/charts/apexcharts/range-area-chart/page.tsx` | `/charts/apexcharts/range-area-chart` | Range area chart component |
| Scatter Chart | `app/(components)/(contentlayout)/charts/apexcharts/scatter-chart/page.tsx` | `/charts/apexcharts/scatter-chart` | Scatter chart component |
| Timeline Chart | `app/(components)/(contentlayout)/charts/apexcharts/timeline-chart/page.tsx` | `/charts/apexcharts/timeline-chart` | Timeline chart component |
| Treemap Chart | `app/(components)/(contentlayout)/charts/apexcharts/treemap-chart/page.tsx` | `/charts/apexcharts/treemap-chart` | Treemap chart component |

### Other Chart Libraries

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| ChartJS | `app/(components)/(contentlayout)/charts/chartjs/page.tsx` | `/charts/chartjs` | Chart.js chart components |
| EChart | `app/(components)/(contentlayout)/charts/echart/page.tsx` | `/charts/echart` | ECharts components |

---

## Table Components

Data table and grid components.

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Data Table | `app/(components)/(contentlayout)/tables/data-table/page.tsx` | `/tables/data-table` | Advanced data table with sorting, filtering, pagination |
| GridJS Table | `app/(components)/(contentlayout)/tables/gridjs-table/page.tsx` | `/tables/gridjs-table` | GridJS table components |
| Table | `app/(components)/(contentlayout)/tables/table/page.tsx` | `/tables/table` | Basic table components |

---

## Page Components

General purpose page components.

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| About Us | `app/(components)/(contentlayout)/pages/about-us/page.tsx` | `/pages/about-us` | About us page template |
| Blog | `app/(components)/(contentlayout)/pages/blog/blog/page.tsx` | `/pages/blog/blog` | Blog listing page |
| Blog Details | `app/(components)/(contentlayout)/pages/blog/blog-details/page.tsx` | `/pages/blog/blog-details` | Blog detail page |
| Create Blog | `app/(components)/(contentlayout)/pages/blog/create-blog/page.tsx` | `/pages/blog/create-blog` | Create blog post page |
| Chat | `app/(components)/(contentlayout)/pages/chat/page.tsx` | `/pages/chat` | Chat interface page |
| Contact Us | `app/(components)/(contentlayout)/pages/contact-us/page.tsx` | `/pages/contact-us` | Contact us form page |
| Contacts | `app/(components)/(contentlayout)/pages/contacts/page.tsx` | `/pages/contacts` | Contacts list page |
| Empty | `app/(components)/(contentlayout)/pages/empty/page.tsx` | `/pages/empty` | Empty state page |
| FAQs | `app/(components)/(contentlayout)/pages/faqs/page.tsx` | `/pages/faqs` | Frequently asked questions page |
| File Manager | `app/(components)/(contentlayout)/pages/filemanager/page.tsx` | `/pages/filemanager` | File manager interface |
| Notifications | `app/(components)/(contentlayout)/pages/notifications/page.tsx` | `/pages/notifications` | Notifications page |
| Pricing | `app/(components)/(contentlayout)/pages/pricing/page.tsx` | `/pages/pricing` | Pricing plans page |
| Profile | `app/(components)/(contentlayout)/pages/profile/page.tsx` | `/pages/profile` | User profile page |
| Reviews | `app/(components)/(contentlayout)/pages/reviews/page.tsx` | `/pages/reviews` | Reviews and ratings page |
| Team | `app/(components)/(contentlayout)/pages/team/page.tsx` | `/pages/team` | Team members page |
| Terms & Conditions | `app/(components)/(contentlayout)/pages/terms&conditions/page.tsx` | `/pages/terms&conditions` | Terms and conditions page |
| Timeline | `app/(components)/(contentlayout)/pages/timeline/page.tsx` | `/pages/timeline` | Timeline page |
| Todo List | `app/(components)/(contentlayout)/pages/todo-list/page.tsx` | `/pages/todo-list` | Todo list page |

### Ecommerce Pages

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Add Products | `app/(components)/(contentlayout)/pages/ecommerce/add-products/page.tsx` | `/pages/ecommerce/add-products` | Add product form |
| Cart | `app/(components)/(contentlayout)/pages/ecommerce/cart/page.tsx` | `/pages/ecommerce/cart` | Shopping cart page |
| Checkout | `app/(components)/(contentlayout)/pages/ecommerce/checkout/page.tsx` | `/pages/ecommerce/checkout` | Checkout page |
| Edit Products | `app/(components)/(contentlayout)/pages/ecommerce/edit-products/page.tsx` | `/pages/ecommerce/edit-products` | Edit product form |
| Order Details | `app/(components)/(contentlayout)/pages/ecommerce/order-details/page.tsx` | `/pages/ecommerce/order-details` | Order details page |
| Orders | `app/(components)/(contentlayout)/pages/ecommerce/orders/page.tsx` | `/pages/ecommerce/orders` | Orders list page |
| Product Details | `app/(components)/(contentlayout)/pages/ecommerce/product-details/page.tsx` | `/pages/ecommerce/product-details` | Product detail page |
| Product List | `app/(components)/(contentlayout)/pages/ecommerce/product-list/page.tsx` | `/pages/ecommerce/product-list` | Product listing page |
| Products | `app/(components)/(contentlayout)/pages/ecommerce/products/page.tsx` | `/pages/ecommerce/products` | Products page |
| Wishlist | `app/(components)/(contentlayout)/pages/ecommerce/wishlist/page.tsx` | `/pages/ecommerce/wishlist` | Wishlist page |

### Email Pages

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Mail App | `app/(components)/(contentlayout)/pages/email/mail-app/page.tsx` | `/pages/email/mail-app` | Email application interface |
| Mail Settings | `app/(components)/(contentlayout)/pages/email/mail-settings/page.tsx` | `/pages/email/mail-settings` | Email settings page |

### Invoice Pages

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Create Invoice | `app/(components)/(contentlayout)/pages/invoice/create-invoice/page.tsx` | `/pages/invoice/create-invoice` | Create invoice form |
| Invoice Details | `app/(components)/(contentlayout)/pages/invoice/invoice-details/page.tsx` | `/pages/invoice/invoice-details` | Invoice details page |
| Invoice List | `app/(components)/(contentlayout)/pages/invoice/invoice-list/page.tsx` | `/pages/invoice/invoice-list` | Invoice listing page |

---

## App Components

Application-specific components.

### CRM App

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Companies | `app/(components)/(contentlayout)/apps/crm/companies/page.tsx` | `/apps/crm/companies` | Companies management page |
| Contacts | `app/(components)/(contentlayout)/apps/crm/contacts/page.tsx` | `/apps/crm/contacts` | Contacts management page |
| Deals | `app/(components)/(contentlayout)/apps/crm/deals/page.tsx` | `/apps/crm/deals` | Deals management page |
| Leads | `app/(components)/(contentlayout)/apps/crm/leads/page.tsx` | `/apps/crm/leads` | Leads management page |
| Teachers | `app/(components)/(contentlayout)/apps/crm/teachers/page.tsx` | `/apps/crm/teachers` | Teachers management page |
| Users | `app/(components)/(contentlayout)/apps/crm/users/page.tsx` | `/apps/crm/users` | Users management page |

### Crypto App

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Buy & Sell | `app/(components)/(contentlayout)/apps/crypto/buy&sell/page.tsx` | `/apps/crypto/buy&sell` | Buy and sell crypto page |
| Currency Exchange | `app/(components)/(contentlayout)/apps/crypto/currency-exchange/page.tsx` | `/apps/crypto/currency-exchange` | Currency exchange page |
| Market Cap | `app/(components)/(contentlayout)/apps/crypto/market-cap/page.tsx` | `/apps/crypto/market-cap` | Market cap page |
| Transactions | `app/(components)/(contentlayout)/apps/crypto/transactions/page.tsx` | `/apps/crypto/transactions` | Transactions page |
| Wallet | `app/(components)/(contentlayout)/apps/crypto/wallet/page.tsx` | `/apps/crypto/wallet` | Crypto wallet page |

### Jobs App

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Candidate Details | `app/(components)/(contentlayout)/apps/jobs/candidate-details/page.tsx` | `/apps/jobs/candidate-details` | Candidate detail page |
| Job Details | `app/(components)/(contentlayout)/apps/jobs/job-details/page.tsx` | `/apps/jobs/job-details` | Job detail page |
| Job Post | `app/(components)/(contentlayout)/apps/jobs/job-post/page.tsx` | `/apps/jobs/job-post` | Post job page |
| Jobs List | `app/(components)/(contentlayout)/apps/jobs/jobs-list/page.tsx` | `/apps/jobs/jobs-list` | Jobs listing page |
| Search Candidate | `app/(components)/(contentlayout)/apps/jobs/search-candidate/page.tsx` | `/apps/jobs/search-candidate` | Search candidates page |
| Search Company | `app/(components)/(contentlayout)/apps/jobs/search-company/page.tsx` | `/apps/jobs/search-company` | Search companies page |
| Search Jobs | `app/(components)/(contentlayout)/apps/jobs/search-jobs/page.tsx` | `/apps/jobs/search-jobs` | Search jobs page |

### NFT App

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Create NFT | `app/(components)/(contentlayout)/apps/nft/create-nft/page.tsx` | `/apps/nft/create-nft` | Create NFT page |
| Live Auction | `app/(components)/(contentlayout)/apps/nft/live-auction/page.tsx` | `/apps/nft/live-auction` | Live auction page |
| Market Place | `app/(components)/(contentlayout)/apps/nft/market-place/page.tsx` | `/apps/nft/market-place` | NFT marketplace page |
| NFT Details | `app/(components)/(contentlayout)/apps/nft/nft-details/page.tsx` | `/apps/nft/nft-details` | NFT detail page |
| Wallet Integration | `app/(components)/(contentlayout)/apps/nft/wallet-integration/page.tsx` | `/apps/nft/wallet-integration` | Wallet integration page |

### Projects App

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Create Project | `app/(components)/(contentlayout)/apps/projects/create-project/page.tsx` | `/apps/projects/create-project` | Create project page |
| Project List | `app/(components)/(contentlayout)/apps/projects/project-list/page.tsx` | `/apps/projects/project-list` | Projects listing page |
| Project Overview | `app/(components)/(contentlayout)/apps/projects/project-overview/page.tsx` | `/apps/projects/project-overview` | Project overview page |

### Other Apps

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Full Calendar | `app/(components)/(contentlayout)/apps/full-calendar/page.tsx` | `/apps/full-calendar` | Full calendar component |
| Gallery | `app/(components)/(contentlayout)/apps/gallery/page.tsx` | `/apps/gallery` | Image gallery component |

---

## Dashboard Components

Dashboard page components for different use cases.

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Analytics | `app/(components)/(contentlayout)/dashboards/analytics/page.tsx` | `/dashboards/analytics` | Analytics dashboard |
| Courses | `app/(components)/(contentlayout)/dashboards/courses/page.tsx` | `/dashboards/courses` | Courses dashboard |
| CRM | `app/(components)/(contentlayout)/dashboards/crm/page.tsx` | `/dashboards/crm` | CRM dashboard |
| Crypto | `app/(components)/(contentlayout)/dashboards/crypto/page.tsx` | `/dashboards/crypto` | Crypto dashboard |
| Ecommerce | `app/(components)/(contentlayout)/dashboards/ecommerce/page.tsx` | `/dashboards/ecommerce` | Ecommerce dashboard |
| HRM | `app/(components)/(contentlayout)/dashboards/hrm/page.tsx` | `/dashboards/hrm` | Human Resource Management dashboard |
| Jobs | `app/(components)/(contentlayout)/dashboards/jobs/page.tsx` | `/dashboards/jobs` | Jobs dashboard |
| NFT | `app/(components)/(contentlayout)/dashboards/nft/page.tsx` | `/dashboards/nft` | NFT dashboard |
| Personal | `app/(components)/(contentlayout)/dashboards/personal/page.tsx` | `/dashboards/personal` | Personal dashboard |
| Projects | `app/(components)/(contentlayout)/dashboards/projects/page.tsx` | `/dashboards/projects` | Projects dashboard |
| Sales | `app/(components)/(contentlayout)/dashboards/sales/page.tsx` | `/dashboards/sales` | Sales dashboard |
| Stocks | `app/(components)/(contentlayout)/dashboards/stocks/page.tsx` | `/dashboards/stocks` | Stocks dashboard |

---

## Utility Components

Utility and helper components.

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Avatars | `app/(components)/(contentlayout)/utilities/avatars/page.tsx` | `/utilities/avatars` | Avatar components |
| Borders | `app/(components)/(contentlayout)/utilities/borders/page.tsx` | `/utilities/borders` | Border utility components |
| Colors | `app/(components)/(contentlayout)/utilities/colors/page.tsx` | `/utilities/colors` | Color utility components |
| Columns | `app/(components)/(contentlayout)/utilities/columns/page.tsx` | `/utilities/columns` | Column layout utilities |
| Flex | `app/(components)/(contentlayout)/utilities/flex/page.tsx` | `/utilities/flex` | Flexbox utility components |
| Grids | `app/(components)/(contentlayout)/utilities/grids/page.tsx` | `/utilities/grids` | Grid layout utilities |
| Typography | `app/(components)/(contentlayout)/utilities/typography/page.tsx` | `/utilities/typography` | Typography utility components |

---

## Widget Components

Widget and dashboard widget components.

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Widgets | `app/(components)/(contentlayout)/widgets/page.tsx` | `/widgets` | Various widget components |

---

## Task Components

Task management components.

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Kanban Board | `app/(components)/(contentlayout)/task/kanban-board/page.tsx` | `/task/kanban-board` | Kanban board task management |
| List View | `app/(components)/(contentlayout)/task/list-view/page.tsx` | `/task/list-view` | Task list view |
| Task Details | `app/(components)/(contentlayout)/task/task-details/page.tsx` | `/task/task-details` | Task detail page |

---

## Maps Components

Map visualization components.

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Leaflet Map | `app/(components)/(contentlayout)/maps/leaflet-map/page.tsx` | `/maps/leaflet-map` | Leaflet map component |
| Vector Maps | `app/(components)/(contentlayout)/maps/vector-maps/page.tsx` | `/maps/vector-maps` | Vector map component |

---

## Icons Component

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Icons | `app/(components)/(contentlayout)/icons/page.tsx` | `/icons` | Icon library showcase |

---

## Authentication Components

Authentication and user management pages.

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Coming Soon | `app/(components)/(authenticationlayout)/authentication/coming-soon/page.tsx` | `/authentication/coming-soon` | Coming soon page |
| Create Password | `app/(components)/(authenticationlayout)/authentication/create-password/page.tsx` | `/authentication/create-password` | Create password page |
| Lock Screen | `app/(components)/(authenticationlayout)/authentication/lock-screen/page.tsx` | `/authentication/lock-screen` | Lock screen page |
| Reset Password | `app/(components)/(authenticationlayout)/authentication/reset-password/page.tsx` | `/authentication/reset-password` | Reset password page |
| Sign In | `app/(components)/(authenticationlayout)/authentication/sign-in/page.tsx` | `/authentication/sign-in` | Sign in page |
| Sign Up | `app/(components)/(authenticationlayout)/authentication/sign-up/page.tsx` | `/authentication/sign-up` | Sign up page |
| Two Step Verification | `app/(components)/(authenticationlayout)/authentication/two-step-verification/page.tsx` | `/authentication/two-step-verification` | Two-step verification page |
| Under Maintenance | `app/(components)/(authenticationlayout)/authentication/under-maintanance/page.tsx` | `/authentication/under-maintanance` | Under maintenance page |

---

## Error Pages

Error page components.

| Component Name | File Path | Route | Description |
|---------------|-----------|-------|-------------|
| Error 401 | `app/(components)/(authenticationlayout)/error/error-401/page.tsx` | `/error/error-401` | Unauthorized error page |
| Error 404 | `app/(components)/(authenticationlayout)/error/error-404/page.tsx` | `/error/error-404` | Not found error page |
| Error 500 | `app/(components)/(authenticationlayout)/error/error-500/page.tsx` | `/error/error-500` | Server error page |

---

## Shared Components

Reusable components used across the application.

| Component Name | File Path | Description |
|---------------|-----------|-------------|
| Auth Guard | `shared/components/AuthGuard.tsx` | Authentication guard component |

---

## Usage Guidelines

### How to Use This Documentation

1. **Finding Components**: Use the table of contents to navigate to the category you need
2. **Component Path**: Each component lists its file path for direct access
3. **Route**: The route shows the URL path where the component is accessible
4. **Description**: Brief description of what the component does

### Best Practices

1. **Reusability**: Check if a component already exists before creating a new one
2. **Consistency**: Use existing components to maintain UI consistency
3. **Customization**: Components can be customized by modifying their respective files
4. **Layout Components**: Always use layout components (Header, Sidebar, Footer) for consistent page structure

### Component Structure

Most page components follow this structure:
- Import necessary dependencies
- Use `Seo` component for page metadata
- Use `Pageheader` component for page header
- Implement the main component content
- Export the component as default

### Example Usage

```tsx
"use client"
import Pageheader from '@/shared/layout-components/page-header/pageheader'
import Seo from '@/shared/layout-components/seo/seo'
import React from 'react'

const MyComponent = () => {
  return (
    <>
      <Seo title={"My Component"} />
      <Pageheader currentpage="My Component" activepage="Category" mainpage="My Component" />
      {/* Your component content here */}
    </>
  )
}

export default MyComponent
```

---

## Notes

- All routes are relative to the base URL
- Components use Next.js App Router structure
- Most components are client-side ("use client")
- Components use Tailwind CSS for styling
- Data for components is typically stored in `shared/data/` directory

---

**Last Updated**: Generated automatically from codebase structure
**Total Components**: 150+ UI components documented

