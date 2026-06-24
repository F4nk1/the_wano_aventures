import React, { useState } from 'react';
import { useSocketContext } from '../../context/SocketContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { backendUrl, saveServerUrl } = useSocketContext();
  const [urlInput, setUrlInput] = useState(backendUrl);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      saveServerUrl(urlInput.trim());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuracion de Conexion">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <Input
          label="URL del Servidor Backend"
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="http://localhost:4000"
          helperText="Direccion de conexion para el servidor WebSocket y API rest."
        />

        <div className="flex justify-end gap-3 mt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default SettingsModal;
