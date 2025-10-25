import React from "react";
import { addons, types } from "storybook/internal/manager-api";
import { IconButton } from "storybook/internal/components";
import { SyncIcon } from "@storybook/icons";

const ADDON_ID = "storybook/refresh-button";
const TOOL_ID = `${ADDON_ID}/tool`;

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: "Refresh",
    match: ({ viewMode, tabId }) => {
      return !!(viewMode && viewMode.match(/^(story|docs)$/));
    },
    render: () => {
      const handleRefresh = () => {
        // Force a hard reload of the iframe
        const iframe = document.getElementById(
          "storybook-preview-iframe"
        ) as HTMLIFrameElement;
        if (iframe) {
          iframe.src = iframe.src;
        }
      };

      return (
        <IconButton
          key={TOOL_ID}
          title="Refresh preview (reload from codebase)"
          onClick={handleRefresh}
        >
          <SyncIcon />
        </IconButton>
      );
    },
  });
});
