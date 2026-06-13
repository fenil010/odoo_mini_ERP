"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Bell, 
  Sparkles, 
  ChevronDown, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Settings,
  Shield,
  FileText,
  HelpCircle,
  LogOut,
  User,
  Activity,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavbarApproval, NavbarNotification } from "@/lib/dashboard-data";
import { confirmSalesOrderAction } from "@/app/actions/sales";
import { confirmPurchaseOrderAction } from "@/app/actions/purchase";
import { startManufacturingOrderAction } from "@/app/actions/manufacturing";

type DashboardHeaderProps = {
  role: string;
  roleTitle: string;
  initialApprovals: NavbarApproval[];
  initialNotifications: NavbarNotification[];
};

export default function DashboardHeader({
  role,
  roleTitle,
  initialApprovals = [],
  initialNotifications = []
}: DashboardHeaderProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [approvalsOpen, setApprovalsOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // State for Approvals and Notifications
  const [approvalsList, setApprovalsList] = useState<NavbarApproval[]>(initialApprovals);
  const [notificationsList, setNotificationsList] = useState<NavbarNotification[]>(initialNotifications);
  const [lastReadTime, setLastReadTime] = useState<number>(0);
  const [pendingApprovalId, setPendingApprovalId] = useState<number | null>(null);

  // Focus search on Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Sync state with incoming layout props using stringified dependencies to avoid infinite loops
  const approvalsKey = JSON.stringify(initialApprovals);
  useEffect(() => {
    setApprovalsList(initialApprovals);
  }, [approvalsKey]);

  const notificationsKey = JSON.stringify(initialNotifications);
  useEffect(() => {
    setNotificationsList(initialNotifications);
  }, [notificationsKey]);

  // Load last read timestamp for notifications badge count
  useEffect(() => {
    const stored = localStorage.getItem(`navbar_notifications_last_read_${role}`);
    if (stored) {
      setLastReadTime(Number(stored));
    } else {
      setLastReadTime(0);
    }
  }, [role]);

  // Relative time helper
  function formatRelativeTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMs < 0 || diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch (e) {
      return "N/A";
    }
  }

  // Handle live confirmations/approvals/releases
  const handleApprovalAction = async (app: NavbarApproval) => {
    setPendingApprovalId(app.id);
    try {
      let result;
      if (app.type === "sales") {
        result = await confirmSalesOrderAction(app.id);
      } else if (app.type === "purchase") {
        result = await confirmPurchaseOrderAction(app.id);
      } else if (app.type === "manufacturing") {
        result = await startManufacturingOrderAction(app.id);
      }

      if (result?.error) {
        alert(`Failed to approve: ${result.error}`);
      } else {
        // Optimistically remove from list immediately
        setApprovalsList((prev) => prev.filter((item) => !(item.id === app.id && item.type === app.type)));
        alert(`${app.title} completed successfully.`);
        setApprovalsOpen(false);
      }
    } catch (error) {
      console.error("Error confirming action:", error);
      alert("An unexpected error occurred.");
    } finally {
      setPendingApprovalId(null);
    }
  };

  const markAllRead = () => {
    const now = Date.now();
    localStorage.setItem(`navbar_notifications_last_read_${role}`, String(now));
    setLastReadTime(now);
  };

  // Compute live unread notifications count
  const unreadNotificationsCount = notificationsList.filter(
    (n) => new Date(n.time).getTime() > lastReadTime
  ).length;

  // Role Quick Actions
  const quickActionsMap: Record<string, Array<{ label: string; href: string; icon: any }>> = {
    sales: [
      { label: "Create Sales Order", href: "/dashboard/sales/sales-orders", icon: Plus },
      { label: "View Shortages", href: "/dashboard/sales/shortages", icon: AlertCircle },
      { label: "Deliver Shipments", href: "/dashboard/sales/delivery-status", icon: CheckCircle }
    ],
    purchase: [
      { label: "Create Purchase Order", href: "/dashboard/purchase/purchase-orders", icon: Plus },
      { label: "Check Shortage Demand", href: "/dashboard/purchase/shortage-demand", icon: AlertCircle },
      { label: "Approved Vendors", href: "/dashboard/purchase/vendors", icon: Sparkles }
    ],
    manufacturing: [
      { label: "Create Manufacturing Order", href: "/dashboard/manufacturing/manufacturing-orders", icon: Plus },
      { label: "Check BoM Planning", href: "/dashboard/manufacturing/bom-planning", icon: FileText },
      { label: "Shop Work Orders", href: "/dashboard/manufacturing/work-orders", icon: Settings }
    ],
    inventory: [
      { label: "Fulfill Deliveries", href: "/dashboard/inventory/deliver-products", icon: CheckCircle },
      { label: "Receive Materials", href: "/dashboard/inventory/receive-materials", icon: Plus },
      { label: "View Ledger", href: "/dashboard/inventory/stock-ledger", icon: Activity }
    ],
    owner: [
      { label: "Revenue Analysis", href: "/dashboard/owner/revenue-view", icon: TrendingUp },
      { label: "Inventory Portfolio", href: "/dashboard/owner/product-master", icon: FileText }
    ],
    admin: [
      { label: "User Directory", href: "/dashboard/admin/users-roles", icon: Sparkles },
      { label: "System Permissions", href: "/dashboard/admin/permissions", icon: Shield },
      { label: "Settings Panel", href: "/dashboard/admin/system-settings", icon: Settings }
    ]
  };

  const quickActions = quickActionsMap[role] || [];

  // Command Palette Items
  const commandPaletteItems = [
    { label: "Sales Dashboard", category: "Navigation", href: "/dashboard/sales" },
    { label: "Sales Orders List", category: "Navigation", href: "/dashboard/sales/sales-orders" },
    { label: "Customers Directory", category: "Navigation", href: "/dashboard/sales/customers" },
    { label: "Sales Shortages", category: "Navigation", href: "/dashboard/sales/shortages" },
    { label: "Procurement Dashboard", category: "Navigation", href: "/dashboard/purchase" },
    { label: "Purchase Orders List", category: "Navigation", href: "/dashboard/purchase/purchase-orders" },
    { label: "Approved Vendors", category: "Navigation", href: "/dashboard/purchase/vendors" },
    { label: "Shortage Demand Fulfill", category: "Navigation", href: "/dashboard/purchase/shortage-demand" },
    { label: "Factory Control Dashboard", category: "Navigation", href: "/dashboard/manufacturing" },
    { label: "Manufacturing Orders", category: "Navigation", href: "/dashboard/manufacturing/manufacturing-orders" },
    { label: "Bill of Materials (BoM)", category: "Navigation", href: "/dashboard/manufacturing/bom-planning" },
    { label: "Work Orders Queue", category: "Navigation", href: "/dashboard/manufacturing/work-orders" },
    { label: "Warehouse Dashboard", category: "Navigation", href: "/dashboard/inventory" },
    { label: "On Hand Inventory", category: "Navigation", href: "/dashboard/inventory/on-hand-stock" },
    { label: "Reserved Inventory", category: "Navigation", href: "/dashboard/inventory/reserved-stock" },
    { label: "Stock Movement Ledger", category: "Navigation", href: "/dashboard/inventory/stock-ledger" },
    { label: "Executive Analytics", category: "Navigation", href: "/dashboard/owner" },
    { label: "Product Portfolio Master", category: "Navigation", href: "/dashboard/owner/product-master" },
    { label: "System Users Admin", category: "Navigation", href: "/dashboard/admin/users-roles" },
    { label: "Access Permissions", category: "Navigation", href: "/dashboard/admin/permissions" },
    { label: "ERP System Settings", category: "Navigation", href: "/dashboard/admin/system-settings" },
    { label: "Application Audit Trail", category: "Navigation", href: "/dashboard/admin/audit-logs" },
  ];

  const filteredCommands = commandPaletteItems.filter((cmd) => 
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#ded4c3] bg-white/70 px-6 backdrop-blur-md sm:px-8">
        {/* Left Side Search Trigger */}
        <div className="flex flex-1 items-center">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-full max-w-sm items-center gap-3 rounded-xl border border-[#ded4c3] bg-white/90 px-3.5 text-left text-sm text-[#68756e] shadow-xs hover:border-[#176b5d]/60 hover:bg-white transition"
          >
            <Search className="size-4 shrink-0 text-[#68756e]" />
            <span className="flex-1 truncate">Search menu, documents...</span>
            <kbd className="hidden rounded bg-[#f7f4ed] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#68756e] border border-[#ded4c3] sm:inline-block">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Side Header Items */}
        <div className="ml-4 flex items-center gap-3">
          
          {/* Quick Actions Dropdown */}
          {quickActions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => {
                  setActionsOpen(!actionsOpen);
                  setNotificationsOpen(false);
                  setApprovalsOpen(false);
                  setProfileOpen(false);
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1f806f] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#176b5d]"
              >
                <Zap className="size-4 shrink-0 text-amber-300 fill-amber-300 animate-pulse" />
                <span>Quick Actions</span>
                <ChevronDown className={cn("size-3.5 transition", actionsOpen && "rotate-180")} />
              </button>

              {actionsOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-[#ded4c3] bg-white p-2 shadow-lg ring-1 ring-black/5 animate-in fade-in-50 duration-100">
                  <div className="px-2 py-1.5 text-xs font-bold uppercase text-[#68756e] border-b border-[#f3ebdd] mb-1">
                    {roleTitle} Actions
                  </div>
                  {quickActions.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <Link
                        key={action.label}
                        href={action.href}
                        onClick={() => setActionsOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#405049] hover:bg-[#eef7f3] hover:text-[#176b5d] transition-colors"
                      >
                        <ActionIcon className="size-4 text-[#176b5d]" />
                        <span>{action.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Approvals Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setApprovalsOpen(!approvalsOpen);
                setNotificationsOpen(false);
                setActionsOpen(false);
                setProfileOpen(false);
              }}
              className={cn(
                "relative flex size-10 items-center justify-center rounded-xl border border-[#ded4c3] bg-white transition hover:bg-[#fffaf0]",
                approvalsOpen && "bg-[#fffaf0] border-[#176b5d]"
              )}
            >
              <CheckCircle className="size-4.5 text-[#405049]" />
              {approvalsList.length > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
                  {approvalsList.length}
                </span>
              )}
            </button>

            {approvalsOpen && (
              <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl border border-[#ded4c3] bg-white p-4 shadow-lg ring-1 ring-black/5 animate-in fade-in-50 duration-100">
                <div className="flex items-center justify-between border-b border-[#f3ebdd] pb-2">
                  <h3 className="font-bold text-sm text-[#18231f]">Approvals Center</h3>
                  <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">Pending</span>
                </div>
                <div className="mt-2 divide-y divide-[#f3ebdd] max-h-80 overflow-y-auto pr-1">
                  {approvalsList.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#68756e]">No pending approvals. All caught up!</div>
                  ) : (
                    approvalsList.map((app) => (
                      <div key={`${app.type}-${app.id}`} className="py-2.5 last:pb-0">
                        <p className="text-xs font-bold text-[#202a25]">{app.title}</p>
                        <p className="mt-0.5 text-xs text-[#53645c] leading-relaxed">{app.desc}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-[#68756e]">{formatRelativeTime(app.time)}</span>
                          <button
                            disabled={pendingApprovalId === app.id}
                            onClick={() => handleApprovalAction(app)}
                            className="rounded-md bg-indigo-600 px-2 py-1 text-[10px] font-bold text-white shadow-xs hover:bg-indigo-700 transition disabled:bg-indigo-400"
                          >
                            {pendingApprovalId === app.id ? "Processing..." : app.action}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setApprovalsOpen(false);
                setActionsOpen(false);
                setProfileOpen(false);
              }}
              className={cn(
                "relative flex size-10 items-center justify-center rounded-xl border border-[#ded4c3] bg-white transition hover:bg-[#fffaf0]",
                notificationsOpen && "bg-[#fffaf0] border-[#176b5d]"
              )}
            >
              <Bell className="size-4.5 text-[#405049]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl border border-[#ded4c3] bg-white p-4 shadow-lg ring-1 ring-black/5 animate-in fade-in-50 duration-100">
                <div className="flex items-center justify-between border-b border-[#f3ebdd] pb-2">
                  <h3 className="font-bold text-sm text-[#18231f]">Live Updates</h3>
                  <button onClick={markAllRead} className="text-[10px] font-bold text-[#176b5d] hover:underline">Mark all read</button>
                </div>
                <div className="mt-2 divide-y divide-[#f3ebdd] max-h-80 overflow-y-auto pr-1">
                  {notificationsList.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#68756e]">No notifications available.</div>
                  ) : (
                    notificationsList.map((notif) => {
                      const isUnread = new Date(notif.time).getTime() > lastReadTime;
                      return (
                        <div key={notif.id} className={cn("py-2.5 flex items-start gap-2.5 last:pb-0 transition-opacity", !isUnread && "opacity-60")}>
                          <div className="mt-0.5">
                            {notif.type === "warning" ? (
                              <AlertCircle className="size-4 text-amber-500" />
                            ) : notif.type === "success" ? (
                              <CheckCircle className="size-4 text-emerald-500" />
                            ) : (
                              <Sparkles className="size-4 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-[#202a25]">{notif.title}</p>
                              {isUnread && (
                                <span className="inline-block size-1.5 rounded-full bg-amber-500" />
                              )}
                            </div>
                            <p className="text-xs text-[#53645c] mt-0.5 leading-relaxed">{notif.desc}</p>
                            <p className="text-[10px] text-[#68756e] mt-1">{formatRelativeTime(notif.time)}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-[#ded4c3]" />

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
                setApprovalsOpen(false);
                setActionsOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-[#ded4c3] bg-[#fffaf0] p-1.5 pr-2.5 hover:bg-white transition"
            >
              <div className="flex size-7.5 items-center justify-center rounded-lg bg-[#176b5d] text-xs font-bold text-white uppercase">
                {role.substring(0, 2)}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-bold text-[#18231f] capitalize">{role}</p>
                <p className="text-[9px] font-medium text-[#68756e] uppercase tracking-wider">{roleTitle}</p>
              </div>
              <ChevronDown className="size-3 text-[#68756e] transition" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-[#ded4c3] bg-white p-2 shadow-lg ring-1 ring-black/5 animate-in fade-in-50 duration-100">
                <div className="px-3 py-2 border-b border-[#f3ebdd] mb-1 text-xs text-[#53645c]">
                  Signed in as <strong className="text-[#18231f] capitalize">{role}</strong>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#405049] hover:bg-[#eef7f3] hover:text-[#176b5d]"
                >
                  <User className="size-4" />
                  <span>My Workspace</span>
                </Link>
                <div className="h-px bg-[#f3ebdd] my-1" />
                <form action="/api/auth/logout" method="POST" className="w-full">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="size-4" />
                    <span>Log Out</span>
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Global Command Palette Dialog */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#1d2520]/50 p-4 pt-24 backdrop-blur-xs">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#ded4c3] bg-white shadow-2xl animate-in zoom-in-95 duration-100">
            {/* Search Input */}
            <div className="flex h-14 items-center border-b border-[#f3ebdd] px-4">
              <Search className="size-5 shrink-0 text-[#68756e]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Type a command or navigate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-3 h-full flex-1 bg-transparent text-sm text-[#18231f] placeholder-[#68756e] outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="rounded-lg border border-[#cfc3ad] bg-white px-2.5 py-1 text-xs font-semibold text-[#53645c] hover:bg-[#fffaf0] transition"
              >
                ESC
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#68756e]">
                Suggestions & Navigation
              </div>
              {filteredCommands.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[#53645c]">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <div className="mt-1 space-y-0.5">
                  {filteredCommands.map((cmd) => (
                    <button
                      key={cmd.label}
                      onClick={() => {
                        setSearchOpen(false);
                        router.push(cmd.href);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-sm font-semibold text-[#405049] hover:bg-[#eef7f3] hover:text-[#176b5d] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="size-4 text-[#176b5d]" />
                        <span>{cmd.label}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-[#68756e] bg-[#f7f4ed] border border-[#ded4c3] px-1.5 py-0.5 rounded">
                        {cmd.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hints */}
            <div className="flex items-center gap-4 bg-[#fbfaf6] border-t border-[#f3ebdd] px-4 py-3 text-[10px] font-semibold text-[#68756e]">
              <span>↑↓ Navigation</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
