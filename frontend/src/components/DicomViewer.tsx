import React, { useEffect, useRef } from 'react';
import { RenderingEngine, Enums, imageLoader } from '@cornerstonejs/core';
import { PanTool, ZoomTool, WindowLevelTool, LengthTool, ToolGroupManager, Enums as ToolEnums, ArrowAnnotateTool } from '@cornerstonejs/tools';

const DicomViewer: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const TOOL_GROUP_ID = 'defaultToolGroup';
  const renderingEngineId = 'myRenderingEngine';
  const viewportId = 'myViewport';

  useEffect(() => {
    if (!elementRef.current || !imageUrl) return;

    // Enregistrement du loader wadouri et dicomParser (une seule fois)
    if (!(window as any).__wadouri_loader_registered) {
      // Injection de dicomParser n'est plus nécessaire avec cornerstonejs/core v3+
      (window as any).__wadouri_loader_registered = true;
    }

    // Création du moteur de rendu et du viewport
    const renderingEngine = new RenderingEngine(renderingEngineId);
    renderingEngine.enableElement({
      viewportId,
      type: Enums.ViewportType.STACK,
      element: elementRef.current,
      defaultOptions: {},
    });

    // Ajout des outils interactifs
    let toolGroup = ToolGroupManager.getToolGroup(TOOL_GROUP_ID);
    if (!toolGroup) {
      toolGroup = ToolGroupManager.createToolGroup(TOOL_GROUP_ID);
      toolGroup!.addTool(PanTool.toolName, PanTool);
      toolGroup!.addTool(ZoomTool.toolName, ZoomTool);
      toolGroup!.addTool(WindowLevelTool.toolName, WindowLevelTool);
      toolGroup!.addTool(LengthTool.toolName, LengthTool);
      toolGroup!.addTool(ArrowAnnotateTool.toolName, ArrowAnnotateTool);
      toolGroup!.setToolActive(PanTool.toolName, { bindings: [{ mouseButton: 2 }] });
      toolGroup!.setToolActive(ZoomTool.toolName, { bindings: [{ mouseButton: 1, modifierKey: ToolEnums.KeyboardBindings.Ctrl }] });
      toolGroup!.setToolActive(WindowLevelTool.toolName, { bindings: [{ mouseButton: 1 }] });
      toolGroup!.setToolActive(LengthTool.toolName, { bindings: [{ mouseButton: 1, modifierKey: ToolEnums.KeyboardBindings.Shift }] });
      toolGroup!.setToolActive(ArrowAnnotateTool.toolName, { bindings: [{ mouseButton: 1, modifierKey: ToolEnums.KeyboardBindings.Alt }] });
    }

    // Correction du schéma d'URL pour le loader
    let imageId = imageUrl;
    if (imageUrl && !imageUrl.startsWith('wadouri:')) {
      imageId = 'wadouri:' + imageUrl;
    }

    // Chargement de l'image et affichage dans le viewport
    imageLoader.loadImage(imageId)
      .then(() => {
        // Cast du viewport pour accéder à setStack
        const viewport = renderingEngine.getViewport(viewportId) as any;
        if (viewport && typeof viewport.setStack === 'function') {
          viewport.setStack({ imageIds: [imageId], currentImageIdIndex: 0 });
          viewport.render();
          if (toolGroup) {
            toolGroup.addViewport(viewportId, renderingEngineId);
          }
        }
      })
      .catch((err: any) => {
        // eslint-disable-next-line no-console
        console.error('Erreur lors du chargement DICOM :', err);
      });

    return () => {
      try {
        renderingEngine.disableElement(viewportId);
      } catch (e) {}
      try {
        if (toolGroup) toolGroup.removeViewports(viewportId, renderingEngineId);
      } catch (e) {}
    };
  }, [imageUrl]);

  return <div className="dicom-viewer" ref={elementRef} />;
};

export default DicomViewer;
