'use client'

import React from 'react'
import { Button } from './button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './card'
import { Input } from './input'
import { Label } from './label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { Textarea } from './textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'

/**
 * ShadCN UI Verification Component
 * Tests all installed components to ensure proper configuration
 */
export function ShadCNVerification() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary font-heading">
            ShadCN UI Components Test
          </CardTitle>
          <CardDescription>
            Verification that all ShadCN components are properly installed and
            themed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Buttons */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Button Variants</Label>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>

          {/* Form Components */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Form Components</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="test-input">Input Field</Label>
                <Input id="test-input" placeholder="Enter text here..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-select">Select Field</Label>
                <Select>
                  <SelectTrigger id="test-select">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-textarea">Textarea</Label>
              <Textarea
                id="test-textarea"
                placeholder="Enter a longer message here..."
                rows={3}
              />
            </div>
          </div>

          {/* Dialog Test */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Dialog Component</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Test Dialog</DialogTitle>
                  <DialogDescription>
                    This dialog tests the ShadCN dialog component with the
                    GoodBuy theme.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      defaultValue="Test Name"
                      className="col-span-3"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Theme Colors Test */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Theme Colors</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-primary text-primary-foreground p-3 rounded-md text-center text-sm">
                Primary
              </div>
              <div className="bg-secondary text-secondary-foreground p-3 rounded-md text-center text-sm">
                Secondary
              </div>
              <div className="bg-success/10 text-success p-3 rounded-md text-center text-sm border">
                Success
              </div>
              <div className="bg-warning/10 text-warning p-3 rounded-md text-center text-sm border">
                Warning
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ShadCNVerification
