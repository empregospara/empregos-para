import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { useSetDefaultScale } from "./hooks";
import { usePDF } from '@react-pdf/renderer';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const fetchPaymentStatus = async (userId: string) => {
  try {
    const response = await fetch(`/api/check-charge-status?userId=${userId}`);
    if (response.ok) {
      const data = await response.json();
      return data.status;
    } else {
      console.error('Failed to fetch charge status');
      return 'unknown';
    }
  } catch (error) {
    console.error('Error fetching charge status:', error);
    return 'error';
  }
};

const updateDownloadStatus = async (userId: string) => {
  try {
    const response = await fetch(`/api/update-download-status?userId=${userId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      console.error('Failed to update download status');
    }
  } catch (error) {
    console.error('Error updating download status:', error);
  }
};

const ResumeControlBar = ({
  scale,
  setScale,
  documentSize,
  document,
  fileName,
}: {
  scale: number;
  setScale: (scale: number) => void;
  documentSize: string;
  document: JSX.Element;
  fileName: string;
}) => {
  const { scaleOnResize, setScaleOnResize } = useSetDefaultScale({
    setScale,
    documentSize,
  });

  const [instance, update] = usePDF({ document });
  const [buttonVisible, setButtonVisible] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  const userId = searchParams.get('userId');
  const txid = searchParams.get('txid');

  useEffect(() => {
    update(document);
  }, [update, document]);

  useEffect(() => {
    const checkDownloadStatus = async () => {
      if (txid) {
        const status = await fetchPaymentStatus(txid);
        setButtonVisible(status !== 'downloaded');
      } else {
        setButtonVisible(false);
      }
    };

    checkDownloadStatus();
  }, [txid]);

  const handleDownload = async () => {
    if (txid) {
      await updateDownloadStatus(txid);
      setButtonVisible(false);
      setDownloadComplete(true);
    }
  };

  useEffect(() => {
    if (downloadComplete) {
      router.push('/');
    }
  }, [downloadComplete, router]);

  // Efeito para ajustar o valor da escala automaticamente ao habilitar autoscale
  useEffect(() => {
    if (scaleOnResize) {
      const isDesktop = window.innerWidth >= 1024; // Verifica se é desktop
      setScale(isDesktop ? 0.5 : 0.4); // 50% no desktop e 40% no responsivo
    }
  }, [scaleOnResize]);

  return (
    <div className="flex-row bottom-0 left-0 right-0 flex h-[var(--resume-control-bar-height)] items-center justify-center px-[var(--resume-padding)] text-primary lg:justify-between">
    <div className="flex items-center gap-2">
      <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
      <input
        type="range"
        min={0.4}
        max={1.5}
        step={0.01}
        value={scale}
        onChange={(e) => {
          setScaleOnResize(false);
          setScale(Number(e.target.value));
        }}
      />
      <div className="w-10">{`${Math.round(scale * 100)}%`}</div>
  
      {/* Condição para exibir o Autoscale somente se o botão de download não estiver visível */}
      {!buttonVisible && (
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4"
            checked={scaleOnResize}
            onChange={() => setScaleOnResize((prev) => !prev)}
          />
          <span className="select-none">Autoscale</span>
        </label>
      )}
    </div>
  
    {buttonVisible && (
      <button onClick={handleDownload}>
        <a
          className="ml-1 flex items-center gap-1 rounded-lg bg-primary px-3 py-0.5 hover:bg-gray-100 lg:ml-8"
          href={instance.url!}
          download={fileName}
        >
          <ArrowDownTrayIcon className="h-4 w-4 text-white" />
          <span className="whitespace-nowrap">Baixar Currículo</span>
        </a>
      </button>
    )}
  </div>
  );
};

// Habilitando CSR para esse componente
export const ResumeControlBarCSR = dynamic(
  () => Promise.resolve(ResumeControlBar),
  {
    ssr: false,
  }
);
