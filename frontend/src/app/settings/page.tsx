'use client';

import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Profile state
  const [name, setName] = useState("John Doe");
  const [role, setRole] = useState("Client");
  const [bio, setBio] = useState("");

  // Notification state
  const [milestoneNotifs, setMilestoneNotifs] = useState(true);
  const [disputeNotifs, setDisputeNotifs] = useState(true);
  const [projectNotifs, setProjectNotifs] = useState(false);

  // Security state
  const [requireConfirmation, setRequireConfirmation] = useState(true);

  const handleSaveProfile = () => {
    console.log("Saving profile:", { name, role, bio });
    alert("Profile settings saved! (placeholder)");
  };

  const handleClearCache = () => {
    localStorage.clear();
    alert("Cache cleared!");
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Profile Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="Client">Client</option>
              <option value="Freelancer">Freelancer</option>
            </select>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <Button onClick={handleSaveProfile}>Save Profile</Button>
        </div>
      </Card>

      {/* Wallet Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Wallet Settings</h2>
        <div className="space-y-4">
          <div>
            <Label>Connected Wallet</Label>
            <Input
              value={address || "Not connected"}
              readOnly
              className="bg-muted"
            />
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => disconnect()}>
              Disconnect Wallet
            </Button>
            <Button variant="outline">Change Wallet</Button>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Milestone Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when milestones are created or updated
              </p>
            </div>
            <Switch
              checked={milestoneNotifs}
              onCheckedChange={setMilestoneNotifs}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Dispute Updates</Label>
              <p className="text-sm text-muted-foreground">
                Notifications for dispute status changes
              </p>
            </div>
            <Switch
              checked={disputeNotifs}
              onCheckedChange={setDisputeNotifs}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Project Activity</Label>
              <p className="text-sm text-muted-foreground">
                Updates on project progress and messages
              </p>
            </div>
            <Switch
              checked={projectNotifs}
              onCheckedChange={setProjectNotifs}
            />
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
        <div className="flex items-center justify-between">
          <div>
            <Label>Require Confirmation</Label>
            <p className="text-sm text-muted-foreground">
              Ask for confirmation before blockchain transactions
            </p>
          </div>
          <Switch
            checked={requireConfirmation}
            onCheckedChange={setRequireConfirmation}
          />
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Appearance</h2>
        <div className="space-y-4">
          <Label>Theme</Label>
          {!mounted ? (
            <div className="flex gap-4">
              <Button variant="outline" disabled>Light</Button>
              <Button variant="outline" disabled>Dark</Button>
              <Button variant="outline" disabled>System</Button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
              >
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
              >
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => setTheme("system")}
              >
                System
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Developer Tools */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Developer Tools</h2>
        <div className="space-y-3">
          <div>
            <Label>Factory Contract</Label>
            <Input
              value={process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "Not configured"}
              readOnly
              className="bg-muted text-xs font-mono"
            />
          </div>
          <div>
            <Label>Backend API</Label>
            <Input
              value={process.env.NEXT_PUBLIC_API_URL || "Not configured"}
              readOnly
              className="bg-muted text-xs"
            />
          </div>
          <div>
            <Label>API Status</Label>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              Connected (placeholder)
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-destructive">
        <h2 className="text-xl font-semibold mb-4 text-destructive">Danger Zone</h2>
        <div className="space-y-4">
          <div>
            <Label>Clear Cache & Reset</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Remove all cached data and reset preferences
            </p>
            <Button variant="destructive" onClick={handleClearCache}>
              Clear Cache
            </Button>
          </div>

          <div>
            <Label>Disconnect Wallet</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Disconnect your wallet from LancerScape
            </p>
            <Button variant="destructive" onClick={() => disconnect()}>
              Disconnect
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
