
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Package,
  Clock,
  Calendar,
  Lock,
  Plus,
  DollarSign,
  User,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { getAllCapsules, getTodayCapsules, getCapsuleBids, Capsule, placeBid, acceptBid } from "@/services/capsuleService";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import AICapsuleWidget from "@/components/AICapsuleWidget";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);
  const [showCapsuleDetails, setShowCapsuleDetails] = useState(false);
  const [allCapsules, setAllCapsules] = useState<Capsule[]>([]);
  const [todayCapsules, setTodayCapsules] = useState<Capsule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [bids, setBids] = useState<any[]>([]);
  const [bidAmount, setBidAmount] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [isAcceptingBid, setIsAcceptingBid] = useState(false);
  const { toast } = useToast();
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchCapsules = async () => {
      try {
        setIsLoading(true);
        const [allCapsulesData, todayCapsulesData] = await Promise.all([
          getAllCapsules(),
          getTodayCapsules(),
        ]);
        setAllCapsules(allCapsulesData);
        setTodayCapsules(todayCapsulesData);
      } catch (error) {
        console.error("Error fetching capsules:", error);
        toast({
          title: "Error",
          description: "Failed to load time capsules",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCapsules();
  }, [toast]);

  const fetchBids = async (capsuleId: string) => {
    try {
      const bidsData = await getCapsuleBids(capsuleId);
      setBids(bidsData);
    } catch (error) {
      console.error("Error fetching bids:", error);
      toast({
        title: "Error",
        description: "Failed to load bids for this capsule",
        variant: "destructive",
      });
    }
  };

  const handleViewCapsule = async (capsule: Capsule) => {
    setSelectedCapsule(capsule);
    setShowCapsuleDetails(true);
    await fetchBids(capsule.id);
    // Reset bid amount
    setBidAmount("");
  };

  const handlePlaceBid = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to place a bid",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCapsule) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Bid",
        description: "Please enter a valid bid amount",
        variant: "destructive",
      });
      return;
    }

    const currentHighestBid = selectedCapsule.current_bid || selectedCapsule.initial_bid;
    const minimumBid = currentHighestBid * 1.1; // 10% higher than current bid

    if (amount < minimumBid) {
      toast({
        title: "Bid Too Low",
        description: `Bid must be at least ${minimumBid.toFixed(3)} BNB (10% higher than current bid)`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsBidding(true);
      await placeBid(selectedCapsule.id, amount, user.id);
      
      toast({
        title: "Success",
        description: "Your bid has been placed successfully",
      });
      
      // Refresh capsule details and bids
      const updatedCapsules = allCapsules.map(c => 
        c.id === selectedCapsule.id 
          ? { ...c, current_bid: amount, highest_bidder_id: user.id } 
          : c
      );
      setAllCapsules(updatedCapsules);
      
      // Update selected capsule
      setSelectedCapsule({ ...selectedCapsule, current_bid: amount, highest_bidder_id: user.id });
      
      // Refresh bids
      await fetchBids(selectedCapsule.id);
      
      // Reset bid amount
      setBidAmount("");
    } catch (error: any) {
      console.error("Error placing bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to place bid",
        variant: "destructive",
      });
    } finally {
      setIsBidding(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    if (!user || !selectedCapsule) return;

    try {
      setIsAcceptingBid(true);
      await acceptBid(selectedCapsule.id, bidId);
      
      toast({
        title: "Success",
        description: "You have accepted the bid. The capsule is now opened!",
      });
      
      // Update capsule status locally
      const updatedCapsules = allCapsules.map(c => 
        c.id === selectedCapsule.id 
          ? { ...c, status: 'opened' } 
          : c
      );
      setAllCapsules(updatedCapsules);
      
      // Close dialog
      setShowCapsuleDetails(false);
      
      // You might want to navigate to the opened capsule view or refresh the current view
    } catch (error: any) {
      console.error("Error accepting bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept bid",
        variant: "destructive",
      });
    } finally {
      setIsAcceptingBid(false);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allCapsules.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allCapsules.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-bold mb-6 text-primary">
          Create Digital Time Capsules on the Blockchain
        </h1>
        <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
          Securely store memories, messages, and media with our blockchain-powered time capsules.
          Set a future date for opening or allow others to bid for early access.
        </p>
        <div className="flex justify-center gap-4">
          {user ? (
            <Button
              size="lg"
              onClick={() => navigate("/profile")}
              className="bg-primary hover:bg-primary/90"
            >
              My Capsules
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => navigate("/profile")}
              className="bg-primary hover:bg-primary/90"
            >
              Get Started
            </Button>
          )}
        </div>
      </div>

      {/* Today's Capsules Section */}
      {todayCapsules.length > 0 && (
        <div className="bg-muted/50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">
              <Calendar className="inline-block mr-2 mb-1" />
              Time Capsules Opening Today
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todayCapsules.map((capsule) => (
                <Card
                  key={capsule.id}
                  className="bg-card hover:shadow-lg transition-shadow cursor-pointer border-primary/10"
                  onClick={() => handleViewCapsule(capsule)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{capsule.name}</CardTitle>
                      <Badge variant={capsule.status === "opened" ? "default" : "outline"}>
                        {capsule.status === "opened" ? "Opened" : "Unlocking Today"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Created by{" "}
                      {capsule.creator?.username || "Anonymous"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 items-center text-sm text-muted-foreground">
                      <Clock size={16} />
                      <span>Opens {format(parseISO(capsule.open_date), "PP")}</span>
                    </div>
                    {capsule.current_bid && (
                      <div className="flex gap-2 items-center text-sm text-muted-foreground mt-2">
                        <DollarSign size={16} />
                        <span>Current bid: {capsule.current_bid} BNB</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Capsules Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">
          <Package className="inline-block mr-2 mb-1" />
          Explore Time Capsules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="bg-card/50 animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-6 bg-muted rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))
          ) : currentItems.length > 0 ? (
            currentItems.map((capsule) => (
              <Card
                key={capsule.id}
                className="bg-card hover:shadow-lg transition-shadow cursor-pointer border-primary/10"
                onClick={() => handleViewCapsule(capsule)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{capsule.name}</CardTitle>
                    <Badge variant={capsule.status === "opened" ? "default" : "outline"}>
                      {capsule.status === "opened" ? "Opened" : "Sealed"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Created by{" "}
                    {capsule.creator?.username || "Anonymous"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 items-center text-sm text-muted-foreground">
                    <Clock size={16} />
                    <span>
                      {capsule.status === "opened"
                        ? "Opened " + formatDistanceToNow(parseISO(capsule.updated_at), { addSuffix: true })
                        : "Opens " + format(parseISO(capsule.open_date), "PP")}
                    </span>
                  </div>
                  {capsule.current_bid && (
                    <div className="flex gap-2 items-center text-sm text-muted-foreground mt-2">
                      <DollarSign size={16} />
                      <span>Current bid: {capsule.current_bid} BNB</span>
                    </div>
                  )}
                  {capsule.encryption_level && (
                    <div className="flex gap-2 items-center text-sm text-muted-foreground mt-2">
                      <Lock size={16} />
                      <span>
                        {capsule.encryption_level.charAt(0).toUpperCase() +
                          capsule.encryption_level.slice(1)}{" "}
                        encryption
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-muted-foreground">No time capsules found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && allCapsules.length > itemsPerPage && (
          <Pagination className="mt-8">
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      paginate(currentPage - 1);
                    }}
                  />
                </PaginationItem>
              )}

              {Array.from({ length: totalPages }, (_, i) => {
                const pageNumber = i + 1;
                // Show first page, last page, and pages around current page
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        isActive={pageNumber === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          paginate(pageNumber);
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      paginate(currentPage + 1);
                    }}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {/* Capsule Detail Dialog */}
      {selectedCapsule && (
        <Dialog open={showCapsuleDetails} onOpenChange={setShowCapsuleDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedCapsule.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="bids">Bids</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Capsule Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <User className="mr-2 text-primary" size={18} />
                          <span className="text-muted-foreground mr-2">Creator:</span>
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage
                              src={selectedCapsule.creator?.avatar_url || ""}
                              alt={selectedCapsule.creator?.username || ""}
                            />
                            <AvatarFallback>
                              {selectedCapsule.creator?.username?.charAt(0) || "A"}
                            </AvatarFallback>
                          </Avatar>
                          <span>{selectedCapsule.creator?.username || "Anonymous"}</span>
                        </div>

                        <div className="flex items-center">
                          <Calendar className="mr-2 text-primary" size={18} />
                          <span className="text-muted-foreground mr-2">Opening Date:</span>
                          <span>{format(parseISO(selectedCapsule.open_date), "PPP")}</span>
                        </div>

                        <div className="flex items-center">
                          <Lock className="mr-2 text-primary" size={18} />
                          <span className="text-muted-foreground mr-2">Encryption:</span>
                          <span>
                            {selectedCapsule.encryption_level?.charAt(0).toUpperCase() +
                              selectedCapsule.encryption_level?.slice(1)}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <DollarSign className="mr-2 text-primary" size={18} />
                          <span className="text-muted-foreground mr-2">Initial Bid:</span>
                          <span>{selectedCapsule.initial_bid} BNB</span>
                        </div>

                        {selectedCapsule.current_bid && (
                          <div className="flex items-center">
                            <DollarSign className="mr-2 text-primary" size={18} />
                            <span className="text-muted-foreground mr-2">Current Bid:</span>
                            <span>{selectedCapsule.current_bid} BNB</span>
                          </div>
                        )}

                        <div className="flex items-center">
                          <Clock className="mr-2 text-primary" size={18} />
                          <span className="text-muted-foreground mr-2">Created:</span>
                          <span>{formatDistanceToNow(parseISO(selectedCapsule.created_at), { addSuffix: true })}</span>
                        </div>

                        <div className="flex items-center">
                          <Badge variant={selectedCapsule.status === "opened" ? "default" : "outline"}>
                            {selectedCapsule.status === "opened" ? "Opened" : "Sealed"}
                          </Badge>
                        </div>
                      </div>

                      {selectedCapsule.message && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-2">Message</h3>
                          <div className="p-4 bg-muted rounded-md">
                            <p>{selectedCapsule.message}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      {selectedCapsule.status === "closed" && (
                        <div className="bg-card p-6 rounded-lg border border-border">
                          <h3 className="text-lg font-medium mb-4">Place a Bid</h3>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Current highest bid: {selectedCapsule.current_bid || selectedCapsule.initial_bid} BNB
                              </p>
                              <p className="text-sm text-muted-foreground mb-4">
                                Minimum bid required:{" "}
                                {((selectedCapsule.current_bid || selectedCapsule.initial_bid) * 1.1).toFixed(3)} BNB
                              </p>
                            </div>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                              <Input
                                type="number"
                                placeholder="Enter bid amount in BNB"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                className="pl-10"
                                step="0.01"
                                min={((selectedCapsule.current_bid || selectedCapsule.initial_bid) * 1.1).toFixed(3)}
                              />
                            </div>
                            <Button 
                              className="w-full" 
                              onClick={handlePlaceBid}
                              disabled={isBidding || !user}
                            >
                              {isBidding ? "Processing..." : "Place Bid"}
                            </Button>
                            {!user && (
                              <p className="text-xs text-muted-foreground text-center mt-2">
                                You need to be signed in to place a bid
                              </p>
                            )}
                          </div>

                          <div className="mt-6">
                            <h4 className="text-sm font-medium mb-2">Bidding Rules:</h4>
                            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                              <li>Minimum bid increment is 10% of the current highest bid</li>
                              <li>Bids are binding and cannot be withdrawn</li>
                              <li>The capsule creator can accept any bid at any time</li>
                              <li>If your bid is outbid, your funds will be automatically returned</li>
                              <li>Platform fee of 2% applies to accepted bids</li>
                            </ul>
                          </div>
                        </div>
                      )}

                      {selectedCapsule.image_url && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-2">Image</h3>
                          <div className="bg-muted rounded-md overflow-hidden">
                            <img
                              src={selectedCapsule.image_url}
                              alt={selectedCapsule.name}
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="bids">
                  {bids.length > 0 ? (
                    <div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Bidder</TableHead>
                            <TableHead>Amount (BNB)</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Status</TableHead>
                            {selectedCapsule.creator_id === user?.id && 
                             selectedCapsule.status === "closed" && (
                              <TableHead className="text-right">Action</TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bids.map((bid) => (
                            <TableRow key={bid.id}>
                              <TableCell className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage
                                    src={bid.bidder?.avatar_url || ""}
                                    alt={bid.bidder?.username || ""}
                                  />
                                  <AvatarFallback>
                                    {bid.bidder?.username?.charAt(0) || "A"}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{bid.bidder?.username || "Anonymous"}</span>
                              </TableCell>
                              <TableCell>{bid.amount}</TableCell>
                              <TableCell>
                                {formatDistanceToNow(parseISO(bid.created_at), { addSuffix: true })}
                              </TableCell>
                              <TableCell>
                                {bid.is_accepted ? (
                                  <Badge>Accepted</Badge>
                                ) : (
                                  <Badge variant="outline">Pending</Badge>
                                )}
                              </TableCell>
                              {selectedCapsule.creator_id === user?.id && 
                               selectedCapsule.status === "closed" && (
                                <TableCell className="text-right">
                                  {!bid.is_accepted && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleAcceptBid(bid.id)}
                                      disabled={isAcceptingBid}
                                    >
                                      {isAcceptingBid ? "Processing..." : "Accept Bid"}
                                    </Button>
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No bids have been placed yet</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* AI Capsule Creation Widget */}
      <AICapsuleWidget />
    </div>
  );
};

export default Index;
