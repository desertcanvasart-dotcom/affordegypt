import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AttractionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: attractions = [] } = useQuery({
    queryKey: ["/api/attractions"],
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["/api/cities"],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Attractions Management</h1>
              <p className="text-sm text-gray-600">Manage attractions and link them to specific cities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attractions Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Total Attractions: {Array.isArray(attractions) ? attractions.length : 0}</p>
                <p>Total Cities: {Array.isArray(cities) ? cities.length : 0}</p>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  Add New Attraction
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}